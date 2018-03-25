let bytes_uploaded = 0;
let bytes_total = 0;
let previous_bytes_loaded = 0;
var max_file_size = 10000000000; 
let upload_timer = 0;
var result_file_size = '';

function secondsToTime(seconds) {
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds - (hours * 3600))/60);
	let remaining_seconds = Math.floor(seconds - (hours * 3600) -  (minutes * 60));
    if (hours < 10) {
        hours = "0" + hours; 
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        remaining_seconds = "0" + seconds;
    }
    if (hours) {
        hours = "00";
    }
	return hours + ':' + minutes + ':' + seconds;
};

function bytesToSize(bytes) {
	let sizes = ['Bytes', 'KB', 'MB'];
    if (bytes === 0) {
        return 'n/a';
    }
	let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function fileSelected(){
    let file = this.getElementById('image_file').files[0];
	let filter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
	let oReader = new FileReader();
	if (! filter.test(file.type)) {
        displayError('invalid_file');
	    return;
    }
	if (file.size > max_file_size) {
        displayError('size');
		return;
	}
	oReader.onload = function(e){
        result_file_size = bytesToSize(file.size);
        let preview_string="<img height='100%' padding='0.2em 0.9em' src='" + e.target.result + "'>"
	    let tr=document.createElement('tr');
	    let td=document.createElement('td');
		td.classList.add('mdl-data-table__cell--non-numeric')

        let parameters={
            'status': 'ready', 
            'name': file.name, 
            'size': result_file_size, 
            'type': file.type, 
            'dimension': preview.naturalWidth + ' x ' + preview.naturalHeight, 
            'preview': preview_string
        };
        for (let parameter in parameters){
            if ( parameters.hasOwnProperty(parameter) ){
                td_tmp=td.cloneNode(true);
                td_tmp.innerHTML=parameters[parameter]
                tr.appendChild(td_tmp)
            }
        }
    		document.getElementById('file-table').appendChild(tr);
	};
	oReader.readAsDataURL(file);
}

function displayError( error_name ){
    let error_list = {
        "invalid_file" : "please select a valid image file",
        "failed" : "an error occured while uploading the file",
        "abort" : "the upload cancelled or dropped",
        "size" : "please select a smaller image"
    }
    document.getElementById('dialog').innerHTML = error_list[error_name];
}

function startUploading() {
	previous_bytes_loaded = 0;
	document.getElementById('progress_percent').innerHTML = '';
	let progress = document.getElementById('progress');
	progress.style.display = 'block';
    progress.style.width = '0px';
	let vFD = new FormData(document.getElementById('upload_form'));
    console.log(vFD);
	let oXHR = new XMLHttpRequest();
	oXHR.upload.addEventListener('progress', uploadProgress, false);
	oXHR.addEventListener('load', uploadFinish, false);
	oXHR.addEventListener('error', displayError("invalid_file"), false);
	oXHR.addEventListener('abort', displayError("abort"), false);
	oXHR.open('POST', 'upload.php');
	oXHR.send(vFD);
	upload_timer = setInterval(doInnerUpdates, 300);
}

function doInnerUpdates() { 
	let iCB = bytes_uploaded;
	let iDiff = iCB - previous_bytes_loaded;
	if (iDiff == 0){
        return;
    }
	previous_bytes_loaded = iCB;
	iDiff = iDiff * 2;
	let iBytesRem = bytes_total - previous_bytes_loaded;
	let secondsRemaining = iBytesRem / iDiff;
	let iSpeed = iDiff.toString() + 'B/s';
	if (iDiff > 1024 * 1024) {
		    iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
		} else if (iDiff > 1024) {
			    iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
			}
	document.getElementById('speed').innerHTML = iSpeed;
	document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);
}

function uploadProgress(e) { 
	if (e.lengthComputable) {
		    bytes_uploaded = e.loaded;
		    bytes_total = e.total;
		    let iPercentComplete = Math.round(e.loaded * 100 / e.total);
		    let iBytesTransfered = bytesToSize(bytes_uploaded);
		    document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
		    document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
		    document.getElementById('b_transfered').innerHTML = iBytesTransfered;
		    if (iPercentComplete == 100) {
				    let oUploadResponse = document.getElementById('upload_response');
				    oUploadResponse.innerHTML = '<h1>Please wait...processing</h1>';
				    oUploadResponse.style.display = 'block';
				}
		} else {
			    document.getElementById('progress').innerHTML = 'unable to compute';
			}
}

function uploadFinish(e) { 
	let oUploadResponse = document.getElementById('upload_response');
	oUploadResponse.innerHTML = e.target.responseText;
	oUploadResponse.style.display = 'block';
	document.getElementById('progress_percent').innerHTML = '100%';
	document.getElementById('progress').style.width = '400px';
	document.getElementById('filesize').innerHTML = result_file_size;
	document.getElementById('remaining').innerHTML = '| 00:00:00';
	clearInterval(upload_timer);
}

