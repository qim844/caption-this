## Command that combines the original video with srt with FFmpeg 
ffmpeg  -i  end_font.mp4  -vf subtitles=words.srt -y output.mp4

## Setting up the workflow in AWS Lambda
https://aws.amazon.com/blogs/media/processing-user-generated-content-using-aws-lambda-and-ffmpeg/

## Reference
Set up fonts in Lambda Function
https://medium.com/creditorwatch/aws-lambda-fonts-libfontconfig-5e837281a4ce

## Bug in Lambda Function
Fonts needed.

Challenge in supporting different languages:
Some language such as Chinese doesn't have space between words.