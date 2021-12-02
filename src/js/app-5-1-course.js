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
           // 创建一个web3的对象, 才能调用web3的api
           web3 = new Web3(web3.currentProvider);
       } else {
          console.log('enter ==> initWeb3()  else........');
           // Specify default instance if no web3 instance provided
           // 否则手动指定要连接的Meta Mask私有链地址
           App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
           // ethereum.enable()方法请求用户授权应用访问MetaMask中的用户账号信息。 
           ethereum.request({ method: 'eth_requestAccounts' });
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
    
        });
        
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {
     // 
      $(document).on('click', '#ShowMyCourses', App.ShowMyCourses);
      $(document).on('click', '#CreateCourse', App.CreateCourse);
      $(document).on('click', '#ApplyCourse', App.ApplyCourse);
      $(document).on('click', '#CreateCourseGrade', App.CreateCourseGrade);  

      $(document).on('click', '#ShowCourseId', App.ShowCourseId);
      $(document).on('click', '#ShowCourseCounts', App.ShowCourseCounts);
      $(document).on('click', '#ShowCourseStudentCounts', App.ShowCourseStudentCounts);
    },


    // 
    ShowMyCourses: function() {
        console.log('enter ==> ShowMyCourses()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
 
        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            instance_ = instance;
            console.log('ShowCourseId start.....');      

            // 先获得所有的地址
            return instance_.getCourseIdByProAddress(account,{from: account, gas: 300000});
        }).then(function(myCoursesId_) { 
            if(myCoursesId_.length == 0){
                alert("죄송합니다\n아직 교수가 수업을 시작하지 않았습니다");
            }
            else{
                for(var i=0;i<myCoursesId_.length;i++){
                    var courseCards =   '<div class="shell">' +
                                            '<div class="main-top">' +
                                                '<h2>'+ myCoursesId_[i] +'</h2>' +
                                                '<div class="ball"><a href="0-2-show_course.html"><img src="./img/2.2.png"></a></div>' +
                                                '<div class="line"></div>' +
                                                '<span>I\'m a professor</span>' +
                                            '</div>' + 
                                            '<div class="main-bottom">' +
                                                '<h2>Professor function</h2>'+
                                                '<span></span>'+
                                            '</div>' +
                                        '</div>';
                    
                    $("#myCoursesId").append(courseCards);
                }

                // 只能查看一次
                //var button_ = document.getElementById("ShowMyCourses");
                //button_.disabled = true;

                console.log("when res ===> " + myCoursesId_.length);
                console.log("when res ===> " + myCoursesId_[0]);
                console.log("when res ===> " + myCoursesId_[1]);
                // 只能查看一次
                var button_ = document.getElementById("ShowMyCourses");
                button_.style.display = "none";
            }

        }).catch(function(err) { 
            console.log('when error ==> account===> : ' + account);
            console.log('ShowMyCourses ==> error = '+ err);
        });

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
            alert("코스가 성공적으로 생성되었습니다.")
            console.log('when res ==> account===> : ' + account);
            console.log('CreateCourse ==> res = '+ res);
        }).catch(function(err) { 
            alert("코스 생성 실패 ><.")
            console.log('when error ==> account===> : ' + account);
            console.log('CreateCourse ==> error = '+ err);
        });

    },

    // 实现课程加入学生
    ApplyCourse: function() {
        console.log('enter ==> ApplyCourse()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        //var nowAuthorization = 0;
        // 获取到元素值
        var apply_course_id= $('#apply_course_id').val();
        var apply_student_address= $('#apply_student_address').val();

        console.log('apply_course_id: ' + apply_course_id + ' ==> apply_professor_address: ' + account);
        console.log('apply_student_address: ' + apply_student_address);

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ApplyCourse start.....');
            
            return instance.applyCourse(apply_course_id,account,apply_student_address,{from: account, gas: 300000});
        }).then(function(res) { 
            // 赋值展示
            alert("학생이 성공적으로 참여되었습니다.")
            console.log('when res ==> account===> : ' + account);
            console.log('ApplyCourse ==> res = '+ res);
        }).catch(function(err) { 
            alert("학생이 참여하지 못했습니다.")
            console.log('when error ==> account===> : ' + account);
            console.log('ApplyCourse ==> error = '+ err);
        });

    },

    // 实现课程赋予学生成绩
    CreateCourseGrade: function() {
        console.log('enter ==> CreateCourseGrade()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        //var nowAuthorization = 0;
        // 获取到元素值
        var grade_courseId= $('#grade_courseId').val();
        var grade_stuBlockAddress= $('#grade_stuBlockAddress').val();
        var grade_stuGrade= $('#grade_stuGrade').val();

        console.log('grade_courseId: ' + grade_courseId + ' ==> grade_professor_address: ' + account);
        console.log('grade_stuBlockAddress: ' + grade_stuBlockAddress + ' ==> grade_stuGrade: ' + grade_stuGrade);

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('CreateCourseGrade start.....');
            
            return instance.createCourseGrade(grade_courseId,account,grade_stuBlockAddress,grade_stuGrade,{from: account, gas: 300000});
        }).then(function(res) { 
            // 赋值展示
            alert("성공적인 점수 입력되었습니다.")
            console.log('when res ==> account===> : ' + account);
            console.log('CreateCourseGrade ==> res = '+ res);
        }).catch(function(err) {
            alert("점수 입력 실패. >< ") 
            console.log('when error ==> account===> : ' + account);
            console.log('CreateCourseGrade ==> error = '+ err);
        });

    },




















    ShowCourseId: function() {
        console.log('enter ==> ShowCourseId()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        
        console.log('pro_address: ' + account);
        
        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowCourseId start.....');
            return instance.getCourseIdByProAddress(account,{from: account, gas: 300000});
        }).then(function(now_conrse_id) { 
            // 赋值展示
            document.getElementById("now_course_count").innerHTML = now_conrse_id;
        }).catch(function(err) { 
            alert('failed!!! ❌');
            console.log('when error ==> account===> : ' + account);
            console.log('ShowCourseId ==> error = '+ err);
        });
    },

    ShowCourseCounts: function() {
        console.log('enter ==> ShowCourseCounts()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
        
        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowCourseCounts start.....');
            return instance.getCourseCounts({from: account, gas: 300000});
        }).then(function(now_course_count) { 
            // 赋值展示
            document.getElementById("now_course_count").innerHTML = now_course_count;
        }).catch(function(err) { 
            alert('failed!!! ❌');
            console.log('when error ==> account===> : ' + account);
            console.log('ShowCourseCounts ==> error = '+ err);
        });


    },

    ShowCourseStudentCounts: function(){
        console.log('enter ==> ShowCourseCounts()');
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);

        // 获取到元素值
        var pro_id= $('#pro_id').val();

        console.log('pro_id>>>: ' + pro_id);

        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            console.log('ShowCourseStudentCounts start.....');
            return instance.getcourseStudentCounts(pro_id,{from: account, gas: 300000});
        }).then(function(now_course_student_counts) { 
            // 赋值展示
            document.getElementById("now_course_count").innerHTML = now_course_student_counts;
        }).catch(function(err) { 
            alert('failed!!! please input professor id');
            console.log('when error ==> account===> : ' + account);
            console.log('ShowCourseCounts ==> error = '+ err);
        });



    }
    











 
  };
  
  
  
  // 页面加载完毕, 自动执行app.init()
  $(function() {
      $(window).load(function() {
          App.init();
      });
  });