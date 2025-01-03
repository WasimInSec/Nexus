import express from 'express';
import { VpnLog } from '../models/VpnLog.js';

const router = express.Router();

// Get recent VPN detection logs with filtering
router.get('/recent', async (req, res) => {
  try {
    const { 
      limit = 100, 
      vpnOnly = false, 
      provider = null,
      minConfidence = 0 
    } = req.query;

    const query = {};
    if (vpnOnly) query.isVpn = true;
    if (provider) query.vpnProvider = provider;
    if (minConfidence) query.confidenceScore = { $gte: parseInt(minConfidence) };

    const logs = await VpnLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Error fetching VPN logs:', error);
    res.status(500).json({ error: 'Failed to fetch VPN logs' });
  }
});

// Get comprehensive VPN detection statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalLogs, vpnStats, providerStats, methodStats] = await Promise.all([
      VpnLog.countDocuments(),
      VpnLog.countDocuments({ isVpn: true }),
      VpnLog.aggregate([
        { $match: { isVpn: true } },
        { $group: { 
          _id: '$vpnProvider',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidenceScore' }
        }},
        { $sort: { count: -1 } }
      ]),
      VpnLog.aggregate([
        { $unwind: '$detectionMethods' },
        { $group: {
          _id: '$detectionMethods',
          count: { $sum: 1 }
        }},
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.json({
      total: totalLogs,
      vpnDetected: vpnStats,
      percentage: totalLogs ? ((vpnStats / totalLogs) * 100).toFixed(2) : 0,
      providers: providerStats,
      detectionMethods: methodStats
    });
  } catch (error) {
    console.error('Error fetching VPN stats:', error);
    res.status(500).json({ error: 'Failed to fetch VPN statistics' });
  }
});

// Get detailed logs for a specific IP
router.get('/ip/:ip', async (req, res) => {
  try {
    const logs = await VpnLog.find({ $or: [{ ip: req.params.ip }, { realIp: req.params.ip }] })
      .sort({ timestamp: -1 });
    
    const analysis = await analyzeIpHistory(logs);
    
    res.json({
      logs,
      analysis
    });
  } catch (error) {
    console.error('Error fetching IP logs:', error);
    res.status(500).json({ error: 'Failed to fetch IP logs' });
  }
});

// Get VPN provider statistics
router.get('/providers', async (req, res) => {
  try {
    const stats = await VpnLog.aggregate([
      { $match: { isVpn: true } },
      { $group: {
        _id: '$vpnProvider',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidenceScore' },
        countries: { $addToSet: '$details.country' },
        detectionMethods: { $addToSet: '$detectionMethods' }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    res.status(500).json({ error: 'Failed to fetch provider statistics' });
  }
});

// Get detection method effectiveness
router.get('/methods', async (req, res) => {
  try {
    const stats = await VpnLog.aggregate([
      { $unwind: '$detectionMethods' },
      { $group: {
        _id: '$detectionMethods',
        total: { $sum: 1 },
        confirmed: {
          $sum: { $cond: [{ $eq: ['$isVpn', true] }, 1, 0] }
        },
        avgConfidence: { $avg: '$confidenceScore' }
      }},
      { $project: {
        method: '$_id',
        total: 1,
        confirmed: 1,
        avgConfidence: 1,
        accuracy: {
          $multiply: [
            { $divide: ['$confirmed', '$total'] },
            100
          ]
        }
      }},
      { $sort: { accuracy: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching method stats:', error);
    res.status(500).json({ error: 'Failed to fetch method statistics' });
  }
});

// Search logs with advanced filtering
router.get('/search', async (req, res) => {
  try {
    const {
      ip,
      provider,
      country,
      minConfidence,
      maxConfidence,
      method,
      startDate,
      endDate,
      limit = 100
    } = req.query;

    const query = {};
    
    if (ip) query.$or = [{ ip }, { realIp: ip }];
    if (provider) query.vpnProvider = provider;
    if (country) query['details.country'] = country;
    if (minConfidence || maxConfidence) {
      query.confidenceScore = {};
      if (minConfidence) query.confidenceScore.$gte = parseInt(minConfidence);
      if (maxConfidence) query.confidenceScore.$lte = parseInt(maxConfidence);
    }
    if (method) query.detectionMethods = method;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await VpnLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ error: 'Failed to search logs' });
  }
});

async function analyzeIpHistory(logs) {
  if (!logs.length) return null;

  const vpnUsage = logs.filter(log => log.isVpn).length;
  const totalLogs = logs.length;
  const providers = new Set(logs.filter(log => log.vpnProvider).map(log => log.vpnProvider));
  const methods = new Set(logs.flatMap(log => log.detectionMethods));
  const locations = new Set(logs.map(log => log.details?.country).filter(Boolean));

  return {
    vpnUsagePercentage: (vpnUsage / totalLogs) * 100,
    knownProviders: Array.from(providers),
    detectionMethods: Array.from(methods),
    locations: Array.from(locations),
    firstSeen: logs[logs.length - 1].timestamp,
    lastSeen: logs[0].timestamp,
    averageConfidence: logs.reduce((acc, log) => acc + (log.confidenceScore || 0), 0) / totalLogs
  };
}

export { router as vpnRouter };