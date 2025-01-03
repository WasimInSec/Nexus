from roboflow import Roboflow

rf = Roboflow(api_key="W6DgvDUjwI7kvKIKjVmr")
project = rf.workspace().project("drug-detection-z6yhe")
model = project.version("1").model

job_id, signed_url, expire_time = model.predict_video(
    "test_video.mp4",
    fps=5,
    prediction_type="batch-video",
)

results = model.poll_until_video_results(job_id)

print(results)


# 'predictions': [
#     {
#         'x': 334.0, 
#         'y': 165.0, 
#         'width': 122.0, 
#         'height': 26.0, 
#         'confidence': 0.9198073148727417, 
#         'class': 'Liquid', 
#         'class_id': 1, 
#         'detection_id': '82ad6dc9-2c98-4f4c-b7ff-1a141cf751a1'
#     }