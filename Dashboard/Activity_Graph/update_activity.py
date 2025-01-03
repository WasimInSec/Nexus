from datetime import datetime
from collections import defaultdict

def update_activity_monitor(users_collection, activity_collection):
    all_users = users_collection.find()

    daily_counts = defaultdict(int)
    for user in all_users:
        # Extract the date portion directly from the "createdAt" field
        created_date = user["createdAt"].date()
        updated_date = user["updatedAt"].date()
        daily_counts[updated_date] += 1


    # Update the "activity" collection with daily user counts
    for date, count in daily_counts.items():
        try:
            # Convert date object to datetime for MongoDB storage
            date_datetime = datetime.combine(date, datetime.min.time())
            
            # Update or insert the document for this date
            activity_collection.update_one(
                {"date": date_datetime},  # Filter by date
                {
                    "$set": {
                        "date": date_datetime,
                        "userCount": count,
                        "lastUpdated": datetime.utcnow()
                    }
                },
                upsert=True  # Create new document if it doesn't exist
            )
            print(f"Successfully updated count for {date}: {count} users")
            
        except Exception as e:
            print(f"Error updating count for {date}: {str(e)}")
