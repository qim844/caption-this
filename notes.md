## Command that combines the original video with srt with FFmpeg 
ffmpeg  -i  end_font.mp4  -vf subtitles=words.srt -y output.mp4

## Setting up the workflow in AWS Lambda
https://aws.amazon.com/blogs/media/processing-user-generated-content-using-aws-lambda-and-ffmpeg/
