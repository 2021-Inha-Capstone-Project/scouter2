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
    
        }).done(App.ShowAddressInf,App.ShowAllStudents);
        
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {

      //$(document).on('click', '#ShowAddressInf', App.ShowAddressInf);
      //$(document).on('click', '#ShowAllStudents', App.ShowAllStudents);

    },
  
    
    // 
    ShowAllStudents: function() {
        console.log('enter ==> ShowAllStudents()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
 
        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            instance_ = instance;
            console.log('ShowAllStudents start.....');      

            // 先获得所有的地址
            return instance_.getAllStudentAddress({from: account, gas: 300000});
        }).then(function(allStudentAddress_) { 
            console.log('allStudentAddress_ = ['+ allStudentAddress_+']');
            var sum = allStudentAddress_.length;
            console.log('sum = '+ sum);
            if(sum == 0){
                alert("현재 학생이 없습니다.");
            }
            else{
                // 展示课程基本信息
                var allStudentInfHead_ = '<thead><tr><th>stuId</th>' +
                                                    '<th>stuName</th>' +
                                                    '<th>stuBlockAddress</th>' + 
                                                    '<th>stuAuthorization</th>' +    
                                                    '<th>myStuCourseIds</th></tr></thead>';
                document.getElementById("allStuInf").innerHTML = allStudentInfHead_;
                for(var i=0;i<sum;i++){
                    instance_.getStudentInfByStuAddress(allStudentAddress_[i],{from: account, gas: 300000}).then(function(studentInf){
                        // 对地址进行处理输出
                        var accountLength = studentInf[2].length;
                        var accountTemp = studentInf[2].slice(0,6) + '..' + studentInf[2].slice(accountLength-4,accountLength);

                        // 通过div添加到页面中  
                        var allStudentInf_ =    '<tr><td>' + studentInf[0] + '</td>' + 
                                                    '<td>' + studentInf[1] + '</td>' + 
                                                    '<td>' + accountTemp + '</td>' + 
                                                    '<td>' + studentInf[3] + '</td>' +
                                                    '<td>' + studentInf[4] + '</td></tr>';
                        
                        $("#allStuInf").append(allStudentInf_);
                        
                    });
                }
            }

        }).catch(function(err) { 
            console.log('when error ==> account===> : ' + account);
            console.log('ShowAllStudents ==> error = '+ err);
        });

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
            console.log('when error ==> account===> : ' + account);
            console.log('ShowAddressInf ==> error = '+ err);
        });

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowAddressInf2 start.....');
            nowAuthorization = instance.getAuthorizationByAddress(account,{from: account, gas: 300000});
            return nowAuthorization;
        }).then(function(nowAuthorization) { 
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
            console.log('when error ==> account===> : ' + account);
            console.log('ShowAddressInf ==> error = '+ err);
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