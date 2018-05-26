(function() {
  var model = {
    currentKing: "",
    currentPriceToClaim: 0.1,
    formerKings: [],
	networkName: ""
  }

  var initWeb3 = function(callback) {
    var abi = [{
        "constant": true,
        "inputs": [],
        "name": "kingdomPrice",
        "outputs": [{
          "name": "",
          "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "currentKingName",
        "outputs": [{
          "name": "",
          "type": "string"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [{
          "name": "name",
          "type": "string"
        }],
        "name": "claim",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [{
            "indexed": false,
            "name": "nameOfKing",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "king",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "price",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "_time",
            "type": "uint256"
          }
        ],
        "name": "ClaimKingdom",
        "type": "event"
      }
    ];
    var contractAddress = "";

    var buildContract = function() {
      model.contract = web3.eth.contract(abi).at(contractAddress);
      model.makeClaimAction = function(name, val) {
		if(name!==undefined && name!=null && name.length!=0){
			model.contract.claim(name, {
			  value: val.toString()
			}, function(err, res) {

			});
		}
		else{
			
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
          contractAddress = '0x999a11a8c4d4950896d370badacfbc8ceaf7216a';
		  model.networkName = 'Sokol';
          buildContract();
          callback();
          break;
        case "99":
          //main
          contractAddress = '0xec78bde2db6da335e04cfa7ed80373dbfb0cd502';
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
    var buildTag = function(id, name, date, price) {
      var retVal = '<p>' +
        '<B><span id="KingsName' + id + '">' + name + '</span></B>' +
        '<span> - Claimed Kingdom:' +
        '<span id="KingdomClaimed' + id + '">' + date + '</span>' +
        '</span>' +
        '<span> ,for a price of:' +
        '<span id="KingdomClaimed2">' + price + '</span> POA' +
        '</span>' +
        '</p>';
      return retVal;
    }
    var setText = function(id, value) {

      var el = document.getElementById(id);
      if (el !== null) {
        el.innerHTML = value;
      }
    }
    var setOnClick = function(id, clbk) {
      var el = document.getElementById(id);
      if (el !== null) {
        el.onclick = clbk;
      }
    }
    model.tmpKingName = document.getElementById("newName").value;
    setText("priceOfKingdom", model.currentPriceToClaim);
    setText("KingsName", model.currentKing);
	setText("networkName",model.networkName);
    setOnClick("makeClaim", function() {
		console.log('makeClaim!');
      model.makeClaimAction(model.tmpKingName, model.currentPriceToClaimInWei);
    })
    var i = 0;
    var fullText = '';
    for (i = 1; i < model.formerKings.length; i++) {
      var tag = buildTag(i,
        model.formerKings[i].name,
        model.formerKings[i].date,
        model.formerKings[i].price);
      fullText = fullText + tag;
    }
    setText("listOfKings", fullText);
  }

  var refreshData = function(callback) {
    var convertToFraction = function(val){
		
      val = val / 1000000;
      val = val / 1000000;
      val = val / 1000000;
	  return val;
	}
	var convertTimestampToDate = function(unix_timestamp){
		var date = (new Date(unix_timestamp*1000)).toISOString().replace(/[^0-9]/g, "").substr(0,8);
		var year = date.substr(0,4);
		var month = date.substr(4,2);
		var day = date.substr(6,2);
		return day+"."+month+"."+year;
		
	}
    model.contract.currentKingName(function(err, val) {
      model.currentKing = val;
    });
    model.contract.kingdomPrice(function(err, val) {
      model.currentPriceToClaimInWei = val;
      model.currentPriceToClaim = convertToFraction(val);
    });
	
	model.events.get(function(error, data){
			var i =0;
			model.formerKings = [];
			for(i=data.length-1;i>=0;i--){
				var price = convertToFraction(data[i].args.price);
				model.formerKings.push({
					name : data[i].args.nameOfKing,
					price : price.toString(),
					date : convertTimestampToDate(data[i].args._time)
				});
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