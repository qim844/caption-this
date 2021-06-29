const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: 'us-east-2',
});

const PUNCTUATIONS = new Set(['.', ',', '?']);
const CAPTION_LENGTH = 8;
const NO_SPACE_LANGUAGE = new Set(['zh-CN', 'ja-JP', 'ko-KR']);

let spaceBtwWordsLanguage = true;
const checkLanguageHasSpaceBtwWords = (handback) => {
  const language = handback.results.language_identification[0].code;
  if (NO_SPACE_LANGUAGE.has(language)) {
    spaceBtwWordsLanguage = false;
  }
};

const timeInSecondsToSrtTime = (time) =>
  new Date(1000 * Number(time)).toISOString().slice(11, -1).replace('.', ',');

const handleCaptionPunctuation = (caption) => {
  let captionSplit = caption.split(''),
    punctuationIndices = [];
  captionSplit.map((char, i) => {
    if (PUNCTUATIONS.has(char)) {
      punctuationIndices.push(i);
    }
  });
  punctuationIndices.reverse();
  punctuationIndices.map((i) => captionSplit.splice(i - 1, 1));
  return captionSplit.join('');
};

const itemsToOutput = (items) => {
  let startIndex = 0,
    duration = 0,
    endIndex = 0,
    endTime = 0,
    currentCaptionIndex = 1;
  let output = [];

  const joinWordsAndPushOutput = () => {
    let caption = items
      .slice(startIndex, endIndex)
      .map((item) => item.alternatives[0].content);

    caption = caption.join(spaceBtwWordsLanguage ? ' ' : '');

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
  };

  while (endIndex < items.length) {
    if (duration < CAPTION_LENGTH) {
      if (items[endIndex].type === 'pronunciation') {
        duration += 1;
        endTime = items[endIndex].end_time;
        if (
          endIndex < items.length - 1 &&
          items[endIndex + 1].type !== 'pronunciation'
        ) {
          endIndex += 1;
        }
      }
      endIndex += 1;
    } else {
      joinWordsAndPushOutput();
    }
  }

  if (startIndex < endIndex) {
    joinWordsAndPushOutput();
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
        checkLanguageHasSpaceBtwWords(handback);
        const items = handback.results.items;
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
// const sampleJson = require('../../test2.json');
// checkLanguageHasSpaceBtwWords(sampleJson);
// console.log(itemsToOutput(sampleJson.results.items));
