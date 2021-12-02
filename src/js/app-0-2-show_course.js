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
            App.contracts.Professor = TruffleContract(data);
            // 配置合约关联的私有链
            App.contracts.Professor.setProvider(App.web3Provider);
        });
        return App.bindEvents();
    },
  
  
    // 绑定事件， 点击按钮出发授权函数
    bindEvents: function() {
     // 留出一个位置
      console.log('enter ==> bindEvents()');
      //return App.ShowCourseInf();
      $('#ShowCourseInf').on('click', App.ShowCourseInf);
    },
  
    // 实现创建课程
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
            return instance.getCourseInfByCourseId(show_course_id,{from: account, gas: 300000});
        }).then(function(courseInf_) { 
            console.log('when courseId ===> : ' + courseInf_[0]);
            if(courseInf_[0] == 0){
                alert("입력한 과정이 존재하지 않습니다")
            }
            else{
                var proAddressLength = courseInf_[2].length;
                var proAddress = courseInf_[2].slice(0,6) + '..' + courseInf_[2].slice(proAddressLength-4,proAddressLength);

                // 展示课程基本信息
                var courInf_ = '<hr>courseId: ' + courseInf_[0] 
                                    + '<br>courseName: ' + courseInf_[1]
                                    + '<br>proAddress: ' + proAddress
                                    + '<br>proAuthorization: ' + courseInf_[3] + '<hr><br><br>';

                                    //+ '----myStuCourses: ' + studentInf[4] + '<br>';
                document.getElementById("courseInf").innerHTML = courInf_;
                // 展示课程学生地址和成绩
                // 得到 多少个学生的  
                var stuAddrSum = courseInf_[4].length;
                console.log('when stuAddrSum ===> : ' + stuAddrSum);  // 2个
                // 创建一个返回数组
                var courseStuAddrSum_ = new Array(stuAddrSum);
                for(var i=0;i<stuAddrSum;i++){
                    // 得到每个地址的长度
                    stuAddrLength = courseInf_[4][i].length;
                    var courseStuAddr_ = courseInf_[4][i].slice(0,6) + '..' + courseInf_[4][i].slice(stuAddrLength-4,stuAddrLength);
                    courseStuAddrSum_[i]= courseStuAddr_;
                }
                document.getElementById("courseStuAddr").innerHTML = 'courseStuAddress: <br>' + courseStuAddrSum_;

                // 成绩部分
                var courseStuGrade_ = 'courseStuGrade: <br>' + courseInf_[5];
                document.getElementById("courseStuGrade").innerHTML = courseStuGrade_;


                console.log('when res ==> account===> : ' + account);
                console.log('ShowCourseInf ==> res = '+ courseInf_);
            }
            
        }).catch(function(err) { 
            console.log('when error ==> account===> : ' + account);
            console.log('ShowCourseInf ==> error = '+ err);
        });

    },

  };
  
  // 页面加载完毕, 自动执行app.init()
  $(function() {
      $(window).load(function() {
          App.init();
      });
  });