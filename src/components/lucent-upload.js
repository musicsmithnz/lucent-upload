'use strict'

import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import * as template_string from "./lucent-upload.html";
const ipfsAPI = require('ipfs-api');

var ipfs = ipfsAPI({
    host: '128.199.245.62',
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
    _printFileInfo(files){
        for (let file of files){
            for (key of Object.keys(files)){
                let nameSpaces=40 - file.name.length
                let typeSpaces=20 - file.type.length
                let sizeSpaces=20 - this._bytesToSize(file.size).length
                let infoString= file.name + Array(nameSpaces).join(" ") + 
                                file.type + Array(typeSpaces).join(" ") + 
                                this._bytesToSize(file.size) + Array(sizeSpaces).join(" ") + 
                                file.webkitRelativePath;
                    console.log(infoString)
            }
        }
    }

    fileSelected(e){
        var files = e.target.files
        var fileData = [];

        console.log("number of files detected: " + files.length)
        this._printFileInfo(files)
        for (let file of files){
	        let reader = new FileReader();
            let blob= new Blob([file])
            reader.onload = e => {
                let folder= file.webkitRelativePath.split('/')[0]
                /*  
                fileData.push({
                    'status'    : 'ready',
                    'name'      : file.name,
                    'path'      : file.webkitRelativePath,
                    'parent'    : folder,
            	    'type'      : file.type,
                    'fileBin'   : reader.result
                });
                */
                fileData.push({
                    'path'      : file.webkitRelativePath,
                    'content'   : reader.result 
                });
            }
            reader.readAsArrayBuffer(blob)
        }
        //updateTable()
            console.log(files);
            console.log(typeof(files));
            console.log(files instanceof Array);
            console.log(Object.keys(files));
            console.log(files.length)

            console.log(fileData);
            console.log(typeof(fileData));
            console.log(fileData instanceof Array);
            console.log(Object.keys(fileData));
            console.log(fileData.length)
        this._saveFiles(fileData)
    };

    _saveFiles(fileData){
        console.log(fileData)
        function prepareData(fileData, cb){
            var ipfsFiles=[];
            console.log(fileData);
            console.log(typeof(fileData));
            console.log(fileData instanceof Array);
            console.log(Object.keys(fileData));
            console.log(fileData.length)
            for (let index in fileData){ 
                file=fileData[index]
                console.log(file)
                ipfsFiles.push({
                    path : file.path,
                    content : file.fileBin
                });
                console.log('ipfsFile: ' + file.path)
            }
            console.log('ipfsFiles: ' + ipfsFiles)
            cb(ipfsFiles)
        }
        function ipfsUpload(ipfsFiles){
            ipfs.files.add(
                ipfsFiles
                , { 
                    recursive: true
                },
                (err, filesAdded) => {
                    if (err) {
                        console.log('error found: ' + err)
                    } else {
                        console.log(filesAdded)
                        for ( let fileAdded of filesAdded ) {
                            console.log('\nFile uploaded: ' + 
                                fileAdded.hash + ' ' + 
                                fileAdded.path + ' ' +
                                fileAdded.size
                            )
                        }
                    }
                }
            )
        }
        prepareData(fileData, ipfsUpload)
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
    	    name: String
	    }
    }

    static get is(){
        return 'lucent-upload';
    }
}

customElements.define("lucent-upload", LucentUpload)

