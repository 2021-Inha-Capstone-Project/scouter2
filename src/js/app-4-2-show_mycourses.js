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
        }).done(App.ShowAddressInf,App.ShowCourseInf,App.TestCountsStuName);
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {
     // 留出一个位置
      console.log('enter ==> bindEvents()');
      $('#ChangeStudentGrade').on('click', App.CreateCourseGrade);
    },
  

    // 这里复用了赋予学生成绩的函数达到修改成绩的目的
    // 实现课程赋予学生成绩
    CreateCourseGrade: function() {
        console.log('enter ==> CreateCourseGrade()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        //var nowAuthorization = 0;
        // 获取到元素值
        var grade_courseId= $('#show_course_id').val();
        var grade_stuBlockAddress= $('#change_student_address').val();
        var grade_stuGrade= $('#change_student_grade').val();

        console.log('grade_courseId: ' + grade_courseId + ' ==> grade_professor_address: ' + account);
        console.log('grade_stuBlockAddress: ' + grade_stuBlockAddress + ' ==> grade_stuGrade: ' + grade_stuGrade);

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('CreateCourseGrade start.....');
            
            return instance.createCourseGrade(grade_courseId,account,grade_stuBlockAddress,grade_stuGrade,{from: account, gas: 300000});
        }).then(function(res) { 
            // 赋值展示
            alert("성공적인 점수 입력되었습니다.")
            // 修改成功后自动刷新页面显示新成绩
            window.location.reload();
            console.log('when res ==> account===> : ' + account);
            console.log('CreateCourseGrade ==> res = '+ res);
        }).catch(function(err) {
            alert("점수 입력 실패. >< ") 
            console.log('when error ==> account===> : ' + account);
            console.log('CreateCourseGrade ==> error = '+ err);
        });
    },


    // 实现
    ShowCourseInf: function() {
 
        console.log('enter ==> ShowCourseInf()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
 
        // 得到值
        var show_course_id = $('#show_course_id').val();
        console.log('show_course_id===> : ' + show_course_id);


        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            instance_ = instance;
            console.log('ShowCourseInf start.....');      

            // 先获得所有的地址
            return instance_.getCourseInfByCourseId(show_course_id,{from: account, gas: 300000});
        }).then(function(courseInf_) { 
            console.log('when courseId ===> : ' + courseInf_[0]);
            if(courseInf_[0] == 0){
                alert("과정이 존재하지 않습니다")
            }
            else{
                var proAddressLength = courseInf_[2].length;
                var proAddress = courseInf_[2].slice(0,6) + '..' + courseInf_[2].slice(proAddressLength-4,proAddressLength);

                // 展示课程基本信息
                var courInfHead_ =  '<thead><tr><th>courseId</th>' +
                                                '<th>courseName</th>' +
                                                '<th>proAddress</th>' +    
                                                '<th>courseStuCounts</th></tr></thead>';
                var courInf_ =      '<tr><td>' + courseInf_[0] + '</td>' + 
                                        '<td>' + courseInf_[1] + '</td>' + 
                                        '<td>' + proAddress + '</td>' + 
                                        '<td>' + courseInf_[3] + '</td></tr>';

                                    //+ '----myStuCourses: ' + studentInf[4] + '<br>';
                document.getElementById("courseInf").innerHTML = courInfHead_ + courInf_;
                return instance_.getCourseStudentInfByCourseId(show_course_id,{from: account, gas: 300000});
            }
        }).then(function(courseAllStudentsInf_){
            
            // 展示课程学生地址和成绩
            // 得到 多少个学生的  
            var stuAddrSum = courseAllStudentsInf_[0].length;
            console.log('when stuAddrSum ===> : ' + stuAddrSum);  // 2个
            
            // 展示学生基本信息
            // 学生table head
            var courseStudentInfHead_ =  '<thead><tr><th>courseStuAddress</th>' +
                                                    '<th>courseStuName</th>' +
                                                    '<th>courseStuGrade</th></tr></thead>';
            document.getElementById("courseStudentInf").innerHTML = courseStudentInfHead_;
            for(var i=0;i<stuAddrSum;i++){
                // 得到每个地址的长度
                //stuAddrLength = courseAllStudentsInf_[4][i].length;
                //var courseStuAddr_ = courseAllStudentsInf_[4][i].slice(0,6) + '..' + courseAllStudentsInf_[4][i].slice(stuAddrLength-4,stuAddrLength);
                // 学生table data
                var courseStudentInf_ = '<tr><td>' + courseAllStudentsInf_[0][i] + '</td>' + 
                                            '<td>' + courseAllStudentsInf_[1][i] + '</td>' + 
                                            '<td>' + courseAllStudentsInf_[2][i] + '</td></tr>';
                $("#courseStudentInf").append(courseStudentInf_);
            }
            console.log('when res ==> account===> : ' + account);
            console.log('ShowCourseInf ==> res = '+ courseAllStudentsInf_);

        }).catch(function(err) { 
            console.log('when error ==> account===> : ' + account);
            console.log('ShowCourseInf ==> error = '+ err);
        });

    },



    // test name
    TestCountsStuName:function(){
        var account = web3.eth.accounts[0]; // msg.sender
        var show_course_id = $('#show_course_id').val();
        console.log('show_course_id===> : ' + show_course_id);
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('TestCountsStuName start.....');
            return instance.getCourseStudentNameByCourseId(show_course_id,{from: account, gas: 300000});
        }).then(function(res) { 
            console.log('TestCountsStuName ==> res = '+ res);
        }).catch(function(err) { 
            console.log('TestCountsStuName ==> error = '+ err);
        });
    },



    // 实现show函数
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