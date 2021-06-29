'use strict';

// set three env variables: 
// S3_AUDIO_BUCKET, input bucket
// S3_TRANSCRIPTION_BUCKET, output bucket
// LANGUAGE_CODE, source Language. in the future we can also use auto detect language feature of AWS transcribe

const awsSdk = require('aws-sdk');
const transcribeService = new awsSdk.TranscribeService();

module.exports.transcribe = (event, context, callback) => {
  const records = event.Records;
  const transcribingPromises = records.map((record) => {
    const recordUrl = 'https://' + process.env.S3_AUDIO_BUCKET + '.s3.us-east-2.amazonaws.com/' + record.s3.object.key
    const TranscriptionJobName = record.s3.object.key.split('/').join('_');
    const outputKey = record.s3.object.key.split('.').slice(0, -1).join('.') + '.json';

    return transcribeService.startTranscriptionJob({
      IdentifyLanguage: true,
      Media: { MediaFileUri: recordUrl },
      TranscriptionJobName,
      OutputBucketName: process.env.S3_TRANSCRIPTION_BUCKET,
      OutputKey: outputKey,
      Settings: {
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: 5
      },
    }).promise();
  });

  Promise.all(transcribingPromises)
    .then(() => {
      callback(null, { message: 'Start transcription job successfully' });
    })
    .catch(err => callback(err, { message: 'Error start transcription job' }));
};
