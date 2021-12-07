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
    
        }).done(App.ShowAddressInf);
        
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {
     // 
      //$(document).on('click', '#ShowMyCourses', App.ShowMyCourses);
      $(document).on('click', '#CreateCourse', App.CreateCourse);
      //$(document).on('click', '#ApplyCourse', App.ApplyCourse);
      //$(document).on('click', '#CreateCourseGrade', App.CreateCourseGrade);  

    },


    // 实现创建课程
    CreateCourse: function() {
        console.log('enter ==> CreateCourse()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        //var nowAuthorization = 0;
        
        // 获取到元素值
        var create_course_id= $('#create_course_id').val();
        var create_course_name= $('#create_course_name').val();


        console.log('create_course_id: ' + create_course_id + ' ==> create_course_name: ' + create_course_name);
        console.log('create_professor_address: ' + account);

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('CreateCourse start.....');              
            return instance.createCourse(create_course_id,create_course_name,account,{from: account, gas: 300000});
        }).then(function(res) { 
            // 赋值展示
            alert("SUCCESSFUL ✅")
            // 成功后自动刷新页面显示新成绩
            window.location.reload();
            console.log('when res ==> account===> : ' + account);
            console.log('CreateCourse ==> res = '+ res);
        }).catch(function(err) { 
            alert("UNSUCCESSFUL ❌")
            console.log(err);
        });

    },



    // 实现的show
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
            alert('Failure ❌');
            console.log(err);
        });

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowAddressInf2 start.....');
            nowAuthorization = instance.getAuthorizationByAddress(account,{from: account, gas: 300000});
            return nowAuthorization;
        }).then(function(nowAuthorization) { 
            if(nowAuthorization != 2){
                alert("Only Professors Have Access To This Page.\n Redirecting to Main Page.")
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
            alert('Failure ❌');
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