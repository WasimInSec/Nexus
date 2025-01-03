import cv2
import os

# Parameters
video_folder = 'Data/Raw Videos'  # Folder containing all video files
output_folder = 'Data/Video Frames'  # Folder to save the extracted frames
interval = 15  # Save every nth frame (adjust interval)

# Create the output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Loop through all the video files in the video folder
for video_file in os.listdir(video_folder):
    video_path = os.path.join(video_folder, video_file)

    # Only process files that are video files
    if video_file.endswith(('.mp4', '.avi', '.mkv', '.mov', '.flv', '.wmv')):
        # Create a subfolder for each video to store the frames
        video_output_folder = os.path.join(output_folder, os.path.splitext(video_file)[0])
        if not os.path.exists(video_output_folder):
            os.makedirs(video_output_folder)

        # Open the video file
        cap = cv2.VideoCapture(video_path)

        # Check if video opened successfully
        if not cap.isOpened():
            print(f"Error: Could not open video {video_path}")
            continue

        frame_count = 0
        saved_frame_count = 0

        # Loop through the video
        while True:
            ret, frame = cap.read()

            # If the frame is read successfully
            if ret:
                # Check if the frame is one we want to save
                if frame_count % interval == 0:
                    frame_filename = os.path.join(video_output_folder, f"frame_{saved_frame_count}.jpg")
                    cv2.imwrite(frame_filename, frame)
                    print(f"Saved {frame_filename}")
                    saved_frame_count += 1

                frame_count += 1
            else:
                break

        # Release the video capture object
        cap.release()
        print(f"Extracted and saved {saved_frame_count} frames from {video_file}.")
    else:
        print(f"Skipped non-video file: {video_file}")

cv2.destroyAllWindows()

print("Processing complete.")
