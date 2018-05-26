(function() {
  var model = {
	isFile:false,
    textToProve: "",
	firstAuthor: "",
	dateOfCreation: "",
	networkName: "",
	proves:[]
  }

  var initWeb3 = function(callback) {
    var abi = [
	{
		"constant": true,
		"inputs": [
			{
				"name": "message",
				"type": "string"
			}
		],
		"name": "validateString",
		"outputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint32"
			},
			{
				"name": "",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "hash",
				"type": "bytes32"
			}
		],
		"name": "validateHash",
		"outputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint32"
			},
			{
				"name": "",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "contentHash",
				"type": "bytes32"
			}
		],
		"name": "insertProve",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "author",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "knowledge",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "time",
				"type": "uint32"
			}
		],
		"name": "ProveInserted",
		"type": "event"
	}];
    var contractAddress = "";

    var buildContract = function() {
	  
	  var convertTimestampToDate = function(unix_timestamp){
		var date = (new Date(unix_timestamp*1000)).toISOString().replace(/[^0-9]/g, "").substr(0,8);
		var year = date.substr(0,4);
		var month = date.substr(4,2);
		var day = date.substr(6,2);
		return day+"."+month+"."+year;
		
	 }
      model.contract = web3.eth.contract(abi).at(contractAddress);
      model.insertProve = function(content) {
		if(content!==undefined && content!=null && content.length!=0){
			model.contract.insertProve(web3.sha3(content), function(err, res) {
				console.log(res);
			});
		}
		else{
			console.log("Error !");
		}
      }
      model.verifyProve = function(content) {
		if(content!==undefined && content!=null && content.length!=0){
			model.contract.validateHash.call(web3.sha3(content), function(err, res) {
				model.firstAuthor = res[0];
				model.dateOfCreation = convertTimestampToDate(res[1]);
			});
		}
		else{
			console.log("Error !");
		}
      }
	  
	  if(model.events===undefined){
			model.events = model.contract.allEvents({fromBlock: 0, toBlock: 'latest'});
			
		}
    }

    web3.version.getNetwork(function(err, netId) {
      switch (netId) {
        case "77":
          //sokol
          contractAddress = '0x4061648c3c2dbb0c4bb35a3775781af08604787f';
		  model.networkName = 'Sokol';
          buildContract();
          callback();
          break;
        case "99":
          //main
          contractAddress = '0xb2c8f7a2806352ff43671e5fc956c3d25d0477ec';
		  model.networkName = 'Core';
          buildContract();
          callback();
          break;
        default:
          alert('Use Metamask and core/sokol.poa.network')
      }
    });

  }


  var drawUI = function() {
	  
	var getText = function(id){
		return  document.getElementById(id).value;
	}
	
    var setText = function(id, value) {

      var el = document.getElementById(id);
      if (el !== null) {
        el.innerHTML = value;
        el.value = value;
      }
    }
	
	setText("networkName",model.networkName);
	if(model.isFile==false){
		model.textToProve = getText('txtToProve');
	}	
	else{
		console.log('Clear txtToProve');
		setText('txtToProve','');
	}
	if( model.firstAuthor == "0x0000000000000000000000000000000000000000"){
		document.getElementById("proofVerification").style.display = 'none';
		document.getElementById("proofVerificationFail").style.display = 'block';
	}
	else
	if(model.firstAuthor.length!=0)
	{
		document.getElementById("proofVerification").style.display = 'block';
		document.getElementById("proofVerificationFail").style.display = 'none';
	}
	setText('addressOfAuthor',model.firstAuthor);
	setText('dateOfFirstOccurence',model.dateOfCreation);
    var setOnClick = function(id, clbk) {
      var el = document.getElementById(id);
      if (el !== null) {
        el.onclick = clbk;
      }
    }
	var readTextFile = function(file,clbk)
	{
		var reader = new FileReader();

		reader.onloadend = function(evt) {
		  console.log(evt);
		  if (evt.target.readyState == FileReader.DONE) { // DONE == 2
			clbk(evt.target.result);
		  }
		};

		var blob = file.slice(0, file.size);
		console.log('Reading file '+file.name);
		reader.readAsBinaryString(blob);
	}
    var setOnChange = function(id, clbk) {
      var el = document.getElementById(id);
      if (el !== null) {
        el.onchange = clbk.bind(el);
      }
    }
	setOnChange("myFile",function(){
		console.log('File change running');
		var file = this.files[0];		
		if(file!=undefined){
			console.log('File reading');
		  readTextFile(file,function(content){
			console.log('File fetched length='+content.length);
			model.textToProve = content;
			model.isFile = true;
		  });
		}
	});
    setOnClick("saveProve", function() {
      model.insertProve(model.textToProve);
    })
    setOnClick("verifyProve", function() {
	  console.log('verifyProve length='+model.textToProve.length);
      model.verifyProve(model.textToProve);
    })
  }

  var refreshData = function(callback) {
    var convertToFraction = function(val){
		
      val = val / 1000000;
      val = val / 1000000;
      val = val / 1000000;
	  return val;
	}
	
	
	model.events.get(function(error, data){
			var i =0;
			model.proves = [];
			for(i=data.length-1;i>=0;i--){
				//console.log(data[i]);
			}
		})

    callback();
  };

  initWeb3(function() {
    setInterval(function() {
      refreshData(drawUI);
    }, 500);
  });
})();