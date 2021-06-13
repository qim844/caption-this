const AWS = require("aws-sdk");

const s3 = new AWS.S3({
	region: "us-east-2"
});

const timeInSecondsToSrtTime = (time) =>
	new Date(1000 * Number(time)).toISOString().slice(11, -1).replace(".", ",");

exports.handler = (event, context, callback) => {
    const records = event.Records;
    records.map((record) => {
        const getTranscriptionParams = {
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key
        }
        s3.getObject(getTranscriptionParams, (err, data) => {
        	if (!err) {
        		const handback = JSON.parse(data.Body.toString());
        		const items = handback.results.items.filter(
        			(item) => item.type === "pronunciation"
        		);
        		const CAPTION_DURATION = 4;
        		let startIndex = 0,
        			duration = 0,
        			endIndex = 0,
        			currentCaptionIndex = 1;
        		let output = [];
        
        		while (endIndex < items.length - 1) {
        			if (duration < CAPTION_DURATION) {
        				duration =
        					Number(items[endIndex].end_time) -
        					Number(items[startIndex].start_time);
        				endIndex += 1;
        			} else {
        				const caption = items
        					.slice(startIndex, endIndex)
        					.map((item) => item.alternatives[0].content)
        					.join(" ");
        
        				output.push(currentCaptionIndex.toString());
        				output.push(
        					timeInSecondsToSrtTime(items[startIndex].start_time) +
        						" --> " +
        						timeInSecondsToSrtTime(items[endIndex].end_time)
        				);
        				output.push(caption);
        				output.push("");
        
        				currentCaptionIndex += 1;
        				startIndex = endIndex;
        				duration = 0;
        			}
        		}
        
        		if (startIndex < endIndex) {
        			const caption = items
        				.slice(startIndex, endIndex)
        				.map((item) => item.alternatives[0].content)
        				.join(" ");
        			output.push(currentCaptionIndex.toString());
        			output.push(
        				timeInSecondsToSrtTime(items[startIndex].start_time) +
        					" --> " +
        					timeInSecondsToSrtTime(items[endIndex].end_time)
        			);
        			output.push(caption);
        			output.push("\n");
        		}
        
                const outputStr = output.join("\n").trim()
                const outputKey = record.s3.object.key.split('.').slice(0, -1).join('.') + '.srt';
                const saveSrtParams = {
                    Bucket: "captionthis-srt-handback",
                    Key: outputKey,
                    Body: Buffer.from(outputStr, 'utf8')
                }
        		s3.putObject(saveSrtParams, (err, data) => {
                    if(!err){
                        console.log('srt write successful.')
                    }
                })
        	} else {
        		console.error(err);
        	}
        });
    });
};
