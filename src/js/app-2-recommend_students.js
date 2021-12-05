function tdclick(res){
    console.log(res);
    var res_ = res.split(",");
    var recommend_course_id_ = res_[0];
    var courseStuAddr_ = res_[1];
    location.replace("2-1-show_student.html?recommend_course_id=" + recommend_course_id_ + "&courseStuAddr="+courseStuAddr_);
}
function tdclick2(){
    location.replace("0-start.html");
}



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
            App.contracts.Professor = TruffleContract(data);
            // 配置合约关联的私有链
            App.contracts.Professor.setProvider(App.web3Provider);
        }).done(App.ShowAddressInf,App.RecommendCourseStudents);
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {
     // 留出一个位置
      console.log('enter ==> bindEvents()');
      //$('#RecommendCourseStudents').on('click', App.RecommendCourseStudents);
    },
  
    // 实现推荐学生的函数,默认推荐3名 ,  设置推荐1名 即 推荐最优秀学生
    RecommendCourseStudents: function() {
        // 默认推荐三名学生
        var topStudents = 3;

        console.log('enter ==> RecommendCourseStudents()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
 
        // 得到值
        var recommend_course_id = $('#recommend_course_id').val();
        console.log('recommend_course_id===> : ' + recommend_course_id);


        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            instance_ = instance;
            console.log('RecommendCourseStudents start.....');      

            // 先获得所有的地址
            return instance_.getCourseInfByCourseId(recommend_course_id,{from: account, gas: 300000});
        }).then(function(courseInf_) { 
            console.log('when courseId ===> : ' + courseInf_[0]);
            if(courseInf_[0] == 0){
                alert("과정이 존재하지 않습니다")
            }
            else{
                var proAddressLength = courseInf_[2].length;
                var proAddress = courseInf_[2].slice(0,6) + '..' + courseInf_[2].slice(proAddressLength-4,proAddressLength);

                // 展示课程基本信息
                var courInfHead_ =  '<thead><tr onclick="tdclick2();\"><th>courseId</th>' +
                                                '<th>courseName</th>' +
                                                '<th>proAddress</th>' +    
                                                '<th>CourseStuCounts</th></tr></thead>';
                var courInf_ =      '<tr onclick="tdclick2();\"><td>' + courseInf_[0] + '</td>' + 
                                        '<td>' + courseInf_[1] + '</td>' + 
                                        '<td>' + proAddress + '</td>' + 
                                        '<td>' + courseInf_[3] + '</td></tr>';

                                    //+ '----myStuCourses: ' + studentInf[4] + '<br>';
                document.getElementById("courseInf").innerHTML = courInfHead_ + courInf_; 
            }
            return instance_.getTopStudentsByCourseId(recommend_course_id,topStudents,{from: account, gas: 300000});
        }).then(async function(courseAllStudentsInf_){
            var getTops = courseAllStudentsInf_[0];
            console.log('when getTops ===> : ' + getTops);  
            if(getTops == 0){
                alert("추천할 학생이 없습니다.");
            }
            else{
                // 展示学生基本信息
                // 学生table head
                var courseStudentInfHead_ =  '<thead><tr><th>courseStuId</th>' +
                                                        '<th>courseStuName</th>' +
                                                        '<th>courseStuAddress</th>' +
                                                        '<th>courseStuGrade</th></tr></thead>';
                document.getElementById("courseStudentInf").innerHTML = courseStudentInfHead_;
                for(var i=0;i<getTops;i++){
                    // 得到每个地址的长度
                    stuAddrLength = courseAllStudentsInf_[2][i].length;
                    var courseStuAddr_ = courseAllStudentsInf_[2][i].slice(0,6) + '..' + courseAllStudentsInf_[2][i].slice(stuAddrLength-4,stuAddrLength);
                    // 学生table data
                    // 异步调用 上面函数要标记async
                    let courseStuName_ = await instance_.getStudentNameById(courseAllStudentsInf_[1][i].c[0],{from: account, gas: 300000});
                    console.log(courseAllStudentsInf_[0][i]);
                    console.log(courseStuName_);
                    //<a href="2-1-show_student.html?recommend_course_id='+recommend_course_id+'&courseStuAddr='+courseAllStudentsInf_[2][i]+'"></a>
                    var courseStudentInf_ = '<tr onclick="tdclick(\''+ recommend_course_id +','+courseAllStudentsInf_[2][i] +'\');\"><td>' + courseAllStudentsInf_[1][i] + '</td>' + 
                                                '<td>' + courseStuName_ + '</td>' +                                      
                                                '<td>' + courseStuAddr_ + '</td>' + 
                                                '<td>' + courseAllStudentsInf_[3][i] + '</td></tr>';
                    $("#courseStudentInf").append(courseStudentInf_);
                }
                console.log('when res ==> account===> : ' + account);
                console.log('RecommendCourseStudents ==> res = '+ courseAllStudentsInf_);
            } 
        }).catch(function(err) { 
            console.log('when error ==> account===> : ' + account);
            console.log('RecommendCourseStudents ==> error = '+ err);
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