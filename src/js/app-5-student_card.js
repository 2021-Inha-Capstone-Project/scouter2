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
        $.getJSON("Professor.json", function(data) {
            console.log('data ==> ' + data);
            App.contracts.Professor = TruffleContract(data);
            // 配置合约关联的私有链
            App.contracts.Professor.setProvider(App.web3Provider);
    
        }).done(App.GetStudentInfo);
    },
  
  
    GetStudentInfo: function() {
        var account = web3.eth.accounts[0]; // msg.sender
        console.log('account===> : ' + account);
 
        // Professor已经得到合约的名称, 实例化智能合约 deployed
        App.contracts.Professor.deployed().then(function(instance) {
            instance_ = instance;
            return instance_.getStudentInfByStuAddress($("#student-address").val(),{from: account, gas: 300000})

        }).then(async function(studentInf) { 
            console.log(studentInf)
            var studentInfoThead =  '<thead><tr><th>Student ID</th>' +
                                                '<th>Name</th>' +
                                                '<th>Address</th>' +    
                                                '<th>Authorization</th></tr></thead>';
            var tHeadTd =      '<tr><td>' + studentInf[0] + '</td>' + 
                                    '<td>' + studentInf[1] + '</td>' + 
                                    '<td>' + studentInf[2] + '</td>' + 
                                    '<td>' + studentInf[3] + '</td></tr>';
                                                
            document.getElementById("studentInfo").innerHTML = studentInfoThead + tHeadTd;


            // 展示课程基本信息
            var allStudentInfHead_ = '<thead><th>Course ID</th>' + 
                                                '<th>Course Name</th>' +
                                                '<th>Grade</th></tr>' +
                                                '</thead>';

            document.getElementById("courseStudentInf").innerHTML = allStudentInfHead_;

            var accountLength = studentInf[2].length;
            var accountTemp = studentInf[2].slice(0,6) + '..' + studentInf[2].slice(accountLength-4,accountLength);

            console.log(typeof(studentInf[4][0].c[0]))
            for(let i = 0; i < studentInf[4].length; i++){
                var courseName;
                let courseInfo = await instance_.getCourseInfByCourseId(studentInf[4][i].c[0], {from: account, gas: 300000});
                courseName = courseInfo[1];
            
                var allStudentInf_ =    '<tr><td>' + studentInf[4][i] +  '</td>' +
                                            '<td>' + courseName + '</td>' +
                                            '<td>' + studentInf[6][i] + '</td>' +
                                            '</tr>';

                $("#courseStudentInf").append(allStudentInf_);
            }

        }).catch(function(err) { 
            console.log("Error in GetStudentInfo");
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