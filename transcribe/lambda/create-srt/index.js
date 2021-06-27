const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: 'us-east-2',
});

const timeInSecondsToSrtTime = (time) =>
  new Date(1000 * Number(time)).toISOString().slice(11, -1).replace('.', ',');

const handleCaptionPunctuation = (caption) => {
  let captionSplit = caption.split(''),
    punctuationIndices = [];
  captionSplit.map((char, i) => {
    if (char === '.') {
      punctuationIndices.push(i);
    }
  });
  punctuationIndices.reverse();
  punctuationIndices.map((i) => captionSplit.splice(i - 1, 1));
  return captionSplit.join('');
};

const itemsToOutput = (items) => {
  const CAPTION_LENGTH = 8;
  let startIndex = 0,
    duration = 0,
    endIndex = 0,
    endTime = 0,
    currentCaptionIndex = 1;
  let output = [];

  while (endIndex < items.length) {
    if (duration < CAPTION_LENGTH) {
      if (items[endIndex].type === 'pronunciation') {
        duration += 1;
        endTime = items[endIndex].end_time;
      }
      endIndex += 1;
    } else {
      let caption = items
        .slice(startIndex, endIndex)
        .map((item) => item.alternatives[0].content)
        .join(' ');
      caption = handleCaptionPunctuation(caption);
      output.push(currentCaptionIndex.toString());
      output.push(
        timeInSecondsToSrtTime(items[startIndex].start_time) +
          ' --> ' +
          timeInSecondsToSrtTime(endTime)
      );
      output.push(caption);
      output.push('');

      endTime = 0;
      currentCaptionIndex += 1;
      startIndex = endIndex;
      duration = 0;
    }
  }

  if (startIndex < endIndex) {
    let caption = items
      .slice(startIndex, endIndex)
      .map((item) => item.alternatives[0].content)
      .join(' ');
    caption = handleCaptionPunctuation(caption);
    output.push(currentCaptionIndex.toString());
    output.push(
      timeInSecondsToSrtTime(items[startIndex].start_time) +
        ' --> ' +
        timeInSecondsToSrtTime(endTime)
    );
    output.push(caption);
    output.push('\n');
  }

  const outputStr = output.join('\n').trim();
  return outputStr;
};

exports.handler = (event, context, callback) => {
  const records = event.Records;
  records.map((record) => {
    const getTranscriptionParams = {
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    };
    s3.getObject(getTranscriptionParams, (err, data) => {
      if (!err) {
        const handback = JSON.parse(data.Body.toString());
        const items = handback.results.items
        const outputKey =
          record.s3.object.key.split('.').slice(0, -1).join('.') + '.srt';
        const saveSrtParams = {
          Bucket: 'captionthis-srt-handback',
          Key: outputKey,
          Body: Buffer.from(itemsToOutput(items), 'utf8'),
        };
        s3.putObject(saveSrtParams, (err, data) => {
          if (!err) {
            console.log('srt write successful.');
          }
        });
      } else {
        console.error(err);
      }
    });
  });
};

// local test
// const sampleJson = require('../../test3.json');
// console.log(itemsToOutput(sampleJson.results.items));
