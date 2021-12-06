function tdclick(addr){
    location.replace("5-student_card.html?addr=" + addr + "&courseId=" + $('#recommend_course_id').val())
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
        // $.getJSON用来获取json格式的文件
        $.getJSON("Professor.json", function(data) {
            App.contracts.Professor = TruffleContract(data);
            // 配置合约关联的私有链
            App.contracts.Professor.setProvider(App.web3Provider);
        }).done(App.ShowAddressInf,App.RecommendCourseStudents);

    },



    // 实现的show
    ShowAddressInf: function() {
        console.log('enter ==> ShowAddressInf()');
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
            alert('failed!!! ❌');
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
            alert('failed!!! ❌');
            console.log(err);
        });


        var accountLength = account.length;
        var acc = account.slice(0,6) + '..' + account.slice(accountLength-4,accountLength);
        document.getElementById("nowAddress").innerHTML = acc;        
    },
  
    // 实现推荐学生的函数,默认推荐3名 ,  设置推荐1名 即 推荐最优秀学生
    RecommendCourseStudents: function() {
        // 默认推荐三名学生
        var topStudents = 3;

        console.log('enter ==> RecommendCourseStudents()');
        var account = web3.eth.accounts[0]; // msg.sender
 
        // 得到值
        var recommend_course_id = $('#recommend_course_id').val();

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            instance_ = instance;  

            // 先获得所有的地址
            return instance_.getCourseInfByCourseId(recommend_course_id,{from: account, gas: 300000});
        }).then(function(courseInf_) { 
            console.log(courseInf_);
            if(courseInf_[0] == 0){
                alert("과정이 존재하지 않습니다 ❌")
            }
            else{
                var proAddressLength = courseInf_[3].length;
                var proAddress = courseInf_[3].slice(0,6) + '..' + courseInf_[3].slice(proAddressLength-4,proAddressLength);

                // 展示课程基本信息
                let courInfHead_ =  '<caption><h2>Course Information</h2></caption'+
                                    '<thead><tr><th>ID</th>' +
                                                '<th>Course Name</th>' +
                                                '<th>Professor Name</th>' +    
                                                '<th>Professor Address</th>' +    
                                                '<th>Total Students</th></tr></thead>';
                let courInf_ =      '<tr><td>' + courseInf_[0] + '</td>' + 
                                        '<td>' + courseInf_[1] + '</td>' + 
                                        '<td>' + courseInf_[2] + '</td>' + 
                                        '<td>' + proAddress + '</td>' + 
                                        '<td>' + courseInf_[4] + '</td></tr>';

                                    //+ '----myStuCourses: ' + studentInf[4] + '<br>';
                document.getElementById("courseInf").innerHTML = courInfHead_ + courInf_; 
            }
            return instance_.getTopStudentsByCourseId(recommend_course_id,topStudents,{from: account, gas: 300000});
        }).then(async function(courseAllStudentsInf_){
            var getTops = courseAllStudentsInf_[0];

            if(getTops == 0){
                alert("추천할 학생이 없습니다. ❌");
            }
            else{
                // 展示学生基本信息
                // 学生table head
                let courseStudentInfHead_ =  '<caption><h2>Top 3 Students</h2></caption'+
                                            '<thead><tr><th>Student ID</th>' +
                                                    '<th>Name</th>' +
                                                    '<th>Wallet Address</th>' +
                                                    '<th>Grade</th></tr></thead>';
                document.getElementById("courseStudentInf").innerHTML = courseStudentInfHead_;
                for(let i=0; i<getTops; i++){

                    // 异步调用 上面函数要标记async
                    let courseStuName_ = await instance_.getStudentNameById(courseAllStudentsInf_[1][i].c[0],{from: account, gas: 300000});
                    let studentID = courseAllStudentsInf_[1][i];
                    let studentGrade = courseAllStudentsInf_[3][i];
                    let studentAddr = courseAllStudentsInf_[2][i];

                    let addressLength = studentAddr.length;
                    let formattedAddress = studentAddr.slice(0,6) + '..' + studentAddr.slice(addressLength-4,addressLength);

                    let courseStudentInf_ = '<tr onclick=\"tdclick(\''+ studentAddr+ '\');\"><td>' + studentID + '</td>' + 
                                                '<td>' + courseStuName_ + '</td>' +                                      
                                                '<td>' + formattedAddress + '</td>' + 
                                                '<td>' + studentGrade + '</td></tr>';
                    $("#courseStudentInf").append(courseStudentInf_);
                }
            } 
        }).catch(function(err) { 
            console.log(err);
        });

    },

  };
  
  // 页面加载完毕, 自动执行app.init()
  $(function() {
      $(window).load(function() {
          App.init();
      });
  });