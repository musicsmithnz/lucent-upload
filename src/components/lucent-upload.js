import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import * as template_string from "./lucent-upload.html";
const ipfsAPI = require('ipfs-api');

/*
var ipfs = ipfsAPI({
    host: '128.199.245.62',
    port: '5002',
    protocol: 'http'
});
*/

export class LucentUpload extends PolymerElement {
    var _ipfs = ipfsAPI({
        host: this.host,
        port: this.port,
        protocol: this.protocol
    })
    _bytesToSize(bytes) {
        let sizes = ['Bytes', 'KB', 'MB'];
        if (bytes === 0) {
            return 'n/a';
        }
        let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    _filter(){
	    let filter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
	    if (! filter.test(file.type)) {
	        displayError('invalid_file');
	        return;
        }
	    if (file.size > this.max_file_size) {
	        displayError('size');
	        return;
        } else { 
	        this.result_file_size = this._bytesToSize(file.size);
        }
    };
    _printObjects(files){
        for (var file of files){
            var infoString = "";
            for ( let key of Object.keys(file)){
                let keySpaces= 30 - file[key].length
                infoString = infoString + file[key] + Array(keySpaces).join(" ")
            }
            console.log(infoString);
        }
    }

    async fileSelected(e){
        var files = e.target.files;
        let ipfsFiles = createIpfsDataArray(files);

        setTimeout(function(){
            uploadFiles(ipfsFiles);
        },10000);

        function createIpfsDataArray(fileList){
            let ipfsFiles=[];
            var ipfsFile;
            for (let file of fileList){
        	    var reader = new FileReader();
                var blob= new Blob([file]);
                reader.onload = function() {
                    var path = file.webkitRelativePath;
                    var content = reader.result;
                    ipfsFile = {
                        path      : path,
                        content   : content
                    };
                    ipfsFiles.push(ipfsFile);
                };
                reader.readAsArrayBuffer(blob);
            }
            return ipfsFiles
        };

        function uploadFiles(ipfsFiles){
            console.log(ipfsFiles);
            for (let ipfsFile of ipfsFiles){
                console.log(ipfsFile);
                var ipfsPath = ipfsFile.path;
                var ipfsContent = ipfsFile.content;
                ipfs.files.add([{
                    path: ipfsPath,
                    content: ipfsContent
                }], (err, fileAdded) => {
                        if (err) {
                            console.log('error found: ' + err);
                        } else {
                            fileAdded.hash + ' ' + 
                            fileAdded.path + ' ' +
                            fileAdded.size
                        }
                    }
                )
            }
            return ipfsFiles;
        };

        for (var file of files){
            console.log('file: ' + file.name);
        }
            for ( let f of ipfsFiles){
                console.log(f)
            }
            /*
        var uploaded = uploadFiles(ipfsFiles)
            */
    };


    _getFile(fileInfo){
        ipfs.files.get(
            '/ipfs/Qme88zhRyhmpv7eN11We2wG1NvyFQXrgoR5tVLZPjNXkpz/zerg.jpeg',
            function(err, res){
                if (err){
                    console.log(err)
                } else{
                    console.log(res)
                }
            }
        )
    };

    constructor(){
        super()
        this.bytes_uploaded = 0;
        this.bytes_total = 0;
        this.previous_bytes_loaded = 0;
        this.max_file_size = 10000000000;
        this.upload_timer = 0;
        this.result_file_size = '';
    };

    static get observers(){}

	static get template() {
        return template_string ;
    }

	static get properties() {
    	return {
            name: String,
            host: String,
            port: String,
            protocol: String
	    };
    }

    static get is(){
        return 'lucent-upload';
    }
}

customElements.define("lucent-upload", LucentUpload)

