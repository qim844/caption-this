import json
import os
import subprocess
import shlex
import boto3

VIDEO_SOURCE_BUCKET = "captionthis202153417-staging"
S3_DESTINATION_BUCKET = "captionthis-video-overlay-handback"
SIGNED_URL_TIMEOUT = 60

def lambda_handler(event, context):
    s3_source_bucket = event['Records'][0]['s3']['bucket']['name']
    s3_source_key = event['Records'][0]['s3']['object']['key']
    
    itemKeyExcludingFormat =  '.'.join(s3_source_key.split('.')[:-1])
    # s3_destination_key = '.'.join(s3_source_key.split('.')[:-1]) + '.mov'
    
    source_video = '/tmp/source_video.mov'
    output_video = '/tmp/output.mov'
    srt_path = '/tmp/caption.srt' 
    
    s3_client = boto3.client('s3')
    s3 = boto3.resource('s3')
    video_source_bucket = s3.Bucket(VIDEO_SOURCE_BUCKET)
    for object in video_source_bucket.objects.filter(Prefix=itemKeyExcludingFormat):
        video_source_key = object.key
        if '.'.join(video_source_key.split('.')[:-1]) == itemKeyExcludingFormat:
            s3_client.download_file(VIDEO_SOURCE_BUCKET, video_source_key, source_video)
            s3_client.download_file(s3_source_bucket, s3_source_key, srt_path)
            
            os.system('/opt/bin/ffmpeg -i "/tmp/source_video.mov" -vf subtitles=/tmp/caption.srt:force_style="FontName=ArialUnicodeMS" -y /tmp/output.mov')
            
            s3_client.upload_file(output_video, S3_DESTINATION_BUCKET, video_source_key)
    

    
    return {
        'statusCode': 200,
        'body': json.dumps('Video overlay complete!'),
    }
