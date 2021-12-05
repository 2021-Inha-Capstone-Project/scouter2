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
        //   console.log('enter ==> initWeb3()  if........');
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
        //   console.log('enter ==> initWeb3()  else........');
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
        // console.log('enter ==> initContract()');
        // $.getJSON用来获取json格式的文件
        $.getJSON("Professor.json", function(data) {
            App.contracts.Professor = TruffleContract(data);
            // 配置合约关联的私有链
            App.contracts.Professor.setProvider(App.web3Provider);
    
        }).done(App.ShowAddressInf,App.ShowAllCourses);
    
    },
  

    // 展示当前所有课程的卡片
    ShowAllCourses: function() {
        console.log('enter ==> ShowAllCourses()');
        var account = web3.eth.accounts[0]; // msg.sender
 
        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {  
            // 先获得所有的course id
            _instance = instance;
            return instance.getAllCourseId({from: account, gas: 300000});
        }).then(async function(allCoursesId_) { 
            console.log(allCoursesId_)
            // console.log("when allCoursesId_ ===> " + allCoursesId_);
            // console.log("when allCoursesId_.length ===> " + allCoursesId_.length);
            if(allCoursesId_[0].length == 0){
                alert("죄송합니다\n아직 수업을 시작하신 교수님이 없습니다 ❌");
            }
            else{
                for(var i=0;i<allCoursesId_[0].length;i++){
                    let courseName = await _instance.getCourseNameByCourseId(allCoursesId_[0][i].c[0]);
                    let isCourseEnded = allCoursesId_[1][i];

                    //If course has ended, it is prioritized to display first
                    if(isCourseEnded == true){
                        var allCourseCards =   '<div class="shell">' +
                            '<div class="main-top" id="' + allCoursesId_[0][i] + '">' +
                                '<h2>'+ "Course ID:" +'</h2>' +
                                '<h2>'+ allCoursesId_[0][i] +'</h2>' +
                                '<div class="ball"><a href="2-recommend_students.html?recommend_course_id='+ allCoursesId_[0][i] +'"><img src="./img/2.6.png"></a></div>' +
                                '<div class="line"></div>' +
                            '</div>' + 
                            '<div class="main-bottom">' +
                                '<h2>'+ courseName +'</h2>' +
                                '<span></span>'+
                            '</div>' +
                        '</div>';

                        $("#allCourses").prepend(allCourseCards);
                        document.getElementById(""+allCoursesId_[0][i]).style.backgroundColor = 'rgba(' + 69 + ',' + 0 + ',' + 0 + ',' + 1 + ')';;
                    }
                    else{
                        var allCourseCards =   '<div class="shell">' +
                            '<div class="main-top" id="' + allCoursesId_[0][i] + '">' +
                                '<h2>'+ "Course ID:" +'</h2>' +
                                '<h2>'+ allCoursesId_[0][i] +'</h2>' +
                                '<div class="ball"><a href="2-recommend_students.html?recommend_course_id='+ allCoursesId_[0][i] +'" class="disabled"><img src="./img/2.6.png"></a></div>' +
                                '<div class="line"></div>' +
                            '</div>' + 
                            '<div class="main-bottom">' +
                                '<h2>'+ courseName +'</h2>' +
                                '<span></span>'+
                            '</div>' +
                        '</div>';    

                        $("#allCourses").append(allCourseCards);
                    }
                }
                // 只能查看一次
                var button_ = document.getElementById("ShowAllCourses");
            }

        }).catch(function(err) { 
            console.log(err);
        });

    },



    // 实现的函数
    ShowAddressInf: function() {
        // console.log('enter ==> ShowAddressInf()');
        var account = web3.eth.accounts[0]; // msg.sender
        
        // 权限值
        var nowID = 0;
        var nowAuthorization = 0;

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
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
            //alert('failed!!! ❌');
            console.log(err);
        });

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
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
            //alert('failed!!! ❌');
            console.log(err);
        });

        var accountLength = account.length;
        var acc = account.slice(0,6) + '..' + account.slice(accountLength-4,accountLength);
        document.getElementById("nowAddress").innerHTML = acc;
    },
 

  };
  
  
  
  // 页面加载完毕, 自动执行app.init()
  $(function() {
      $(window).load(function() {
          App.init();
      });
  });