import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import * as template_string from "./lucent-upload.html";
const ipfsAPI = require('ipfs-api');

var ipfs = ipfsAPI({
    host: '128.199.220.242',
    port: '5002',
    protocol: 'http'
});

export class LucentUpload extends PolymerElement {
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

    fileSelected(e){
        var files = e.target.files
        for (let file of files){
	        var reader = new FileReader();
            var preview = document.createElement('img');
            reader.onload = e => {
                preview.height = '100%';
    	        let parameters={
                    'status': 'ready',
                    'name': file.name,
            	    'type': file.type,
                    'fileBin': reader.result
                };
                this._saveFile(parameters)
                this.push('files', parameters);
            }
            reader.readAsArrayBuffer(new Blob([file]))
        }
    };

    _saveFile(parameters){
        var fileBuffer= Buffer(parameters.fileBin)
        ipfs.files.add({
            path: parameters.name,
            content: fileBuffer
        }, { 
            recursive: true,
            progress: (prog) => console.log(`received: ${prog}`)
        }, (err, filesAdded) => {
            if (err) {
                console.log('error found: ' + err)
            } else {
                console.log('\nAdded file:', filesAdded);
            }
        })
    };

    _getFile(parameters){
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
        this.files=[];
    };

    static get observers(){}

	static get template() {
        return template_string ;
    }

	static get properties() {
    	return {
    	    name: String
	    }
    }

    static get is(){
        return 'lucent-upload';
    }
}

customElements.define("lucent-upload", LucentUpload)

