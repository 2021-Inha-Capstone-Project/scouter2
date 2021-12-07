App = {    

    // 定义三个变量
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
  
    // 定义了一个初始化函数
    init: function() {          // void init(){}
        // 调用initWeb3()
        return App.initWeb3();
    },
  
    // 实例化web3对象
    initWeb3: function() {
      // TODO: refactor conditional
       if (typeof web3 !== 'undefined') {
          console.log('enter ==> initWeb3()  if........');
           // If a web3 instance is already provided by Meta Mask.
           // 当前有Meta Mask私有链, 则返回Meta Mask私有链的信息
           App.web3Provider = web3.currentProvider;
           // ethereum.enable()方法请求用户授权应用访问MetaMask中的用户账号信息。 
           ethereum.request({ method: 'eth_requestAccounts' });
           // 实时监听meta mask的地址切换
           ethereum.on('accountsChanged', function (accounts) {
                console.log(accounts[0]);
                App.ShowAddressInf();
           })
           // 创建一个web3的对象, 才能调用web3的api
           web3 = new Web3(web3.currentProvider);
       } else {
          console.log('enter ==> initWeb3()  else........');
           // Specify default instance if no web3 instance provided
           // 否则手动指定要连接的Meta Mask私有链地址
           App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
           // ethereum.enable()方法请求用户授权应用访问MetaMask中的用户账号信息。 
           ethereum.request({ method: 'eth_requestAccounts' });
           // 实时监听meta mask的地址切换
           ethereum.on('accountsChanged', function (accounts) {
                console.log(accounts[0]);
                App.ShowAddressInf();
           })
           // 创建一个web3的对象, 才能调用web3的api
           web3 = new Web3(App.web3Provider);
       }
       // 调用initContract()
       return App.initContract();
   },
  
  
    // 初始化智能合约
    initContract: function() {
        console.log('enter ==> initContract()');
        // $.getJSON用来获取json格式的文件
        $.getJSON("Professor.json", function(data) {
            console.log('data ==> ' + data);
            App.contracts.Professor = TruffleContract(data);
            // 配置合约关联的私有链
            App.contracts.Professor.setProvider(App.web3Provider);
    
        }).done(App.ShowAddressInf);;
        
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {
      $(document).on('click', '#SetPermission', App.SetPermission);
      $(document).on('click', '#RemovePermission', App.RemovePermission);
      //$(document).on('click', '#ShowAddressInf', App.ShowAddressInf);

    },
  
    // 实现权限授予的函数
    SetPermission: function() {
        console.log('enter ==> SetPermission()');

        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);

        // 获取到元素值
        var set_address= document.getElementById("set_address").value;
        var set_name= document.getElementById("set_name").value;
        // 得到权限值
        var setAuthority;
        var authority_ = document.getElementsByName('authority');
        for(var i=0;i<authority_.length;i++){
			if(authority_[i].checked)
				setAuthority = authority_[i].value;
		}

        console.log('set_address: ' + set_address + ' ==> setAuthority: ' + setAuthority);

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('SetPermission start.....');
                      
            return instance.setPermission(set_address,set_name,setAuthority,{from: account, gas: 300000});
        }).then(function(res) { 
            // 赋值展示
            alert("SUCCESSFUL ✅")
            // 修改成功后自动刷新页面显示新成绩
            window.location.reload();
            console.log('account ===> : ' + account);
            console.log('SetPermission ==> res = '+ res);
        }).catch(function(err) { 
            alert("UNSUCCESSFUL ❌")
            console.log(err);
        });

    },

    // 实现权限取消的函数
    RemovePermission: async function() {
        try {
            console.log('enter ==> RemovePermission()');

            var account = web3.eth.accounts[0]; // msg.sender
            console.log('account===> : ' + account);
            var nowAuthorization = 0;
            // 获取到元素值
            var remove_address= $('#remove_address').val();
            console.log('remove_address: ' + remove_address);

            let canRemove = true;

            let instance = await App.contracts.Professor.deployed();

            let profCourses = await instance.getCourseIdByProAddress(remove_address,{from: account, gas: 300000});

            for(let i=0; i<profCourses.length; i++){
                let course = await instance.getCourseNameStatusById(profCourses[i].c[0]);

                let isCourseEnded = course[1];
                if(!isCourseEnded){
                    canRemove = false;
                    break;
                }
            }
            console.log(canRemove);

            if(canRemove){
                App.contracts.Professor.deployed().then(function(instance) {
                    console.log('RemovePermission start.....');
                    return instance.removePermission(remove_address,{from: account, gas: 300000});
                }).then(function(res) { 
                    alert("SUCCESSFUL ✅")
                    // 修改成功后自动刷新页面显示新成绩
                    window.location.reload();
                    console.log('account ===> : ' + account);
                    console.log('SetPermission ==> res = '+ res);
                }).catch(function(err) { 
                    alert("UNSUCCESSFUL ❌")
                });
            }
            else{
                throw("");
            }

        } catch (error) {
            alert("Cannot Remove This Person At The Moment! ❌");
        }
    },


    // 实现的函数
    ShowAddressInf: function() {
        console.log('enter ==> ShowAddressInf()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        
        // 权限值
        var nowID = 0;
        var nowAuthorization = 0;

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowAddressInf1 start.....');
            nowID = instance.getIdByAddress(account,{from: account, gas: 300000});
            return nowID;
        }).then(function(nowID) { 
            // 赋值展示
            var nowId = '';
            if(nowID == 1){
                nowId = '1(root)';
            }
            else if(nowID == 0){
                nowId = 'null';
            }
            else{
                nowId = nowID;
            }
            document.getElementById("nowID").innerHTML = "ID: "+nowId;
        }).catch(function(err) { 
            alert('failed!!! ❌');
            console.log(err);
        });

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowAddressInf2 start.....');
            nowAuthorization = instance.getAuthorizationByAddress(account,{from: account, gas: 300000});
            return nowAuthorization;
        }).then(function(nowAuthorization) { 
            if(nowAuthorization != 3){
                alert("Only Admins Have Access To This Page.\n Redirecting to Main Page.")
                location.replace("index.html")
            }
            // 赋值展示
            var nowAut = '';
            if(nowAuthorization == 1){
                nowAut = 'student';
            }
            else if(nowAuthorization == 2){
                nowAut = 'professor';
            }
            else if(nowAuthorization == 3){
                nowAut = 'admin';
            }
            else{
                nowAut = 'null';
            }
            document.getElementById("nowPrefession").innerHTML = "권한: "+nowAut;
        }).catch(function(err) { 
            alert('failed!!! ❌');
            console.log(err);
        });


        var accountLength = account.length;
        var acc = account.slice(0,6) + '..' + account.slice(accountLength-4,accountLength);
        document.getElementById("nowAddress").innerHTML = acc;
        console.log('ShowAddressInf ==> acc = '+ acc);

        
    },




 
  };
  
  
  
  // 页面加载完毕, 自动执行app.init()
  $(function() {
      $(window).load(function() {
          App.init();
      });
  });