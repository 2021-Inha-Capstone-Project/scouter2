// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/*

1. 保存当前地址的权限结构体:  Save the permission structure of the current address
    AdminSelf,  ProfessorSelf,  StudentSelf

2. 保存课程的详细信息: Save course details
    CourseInf,  CourseStudent

3. modifier function
    onlyAdmin,  onlyProfessor,  checkIsStudent


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

4.1. setter function

    setcourseStudentCounts          // 设置course id的学生人数(当学生加入课程的时候,调用一次,内部函数)
                                    // Set the number of students with the course ID (called once when the student joins the course)


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

4.2 getter function

    getMsgSender                    // 查看当前的msg.sender
    
    getMsgSenderAuthorization       // 查看当前msg.sender的权限是多少

    ==> getIdByAddress()            // 通过address查找此人的id , Find this person's id through address

    ==> getStuAddressByStuId()            // 通过ID查找此人的地址  ,  Find this person's address by ID

    getAuthorizationByAddress()     // 通过address查找此人的authorization , Find this person's authorization through address

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// getter about admin
    getAdminCounts()                // 得到当前管理员的总人数
    getAdminIndexByAddress()        // 通过 address 找到admin中的index , Find the index in admin by address

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// getter about professor
    getProfessorCounts()            // 得到当前教师的总人数
    getProfessorIndexByAddress()    // 通过 address 找到professor中的index , Find the index in the professor by address
    getProfessorInfByProAddress()   // 通过proAddress获取整个pro的信息

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// getter about student
    getStudentCounts()              // 得到当前学生的总人数
    getStudentIndexByAddress()      // 通过 address 找到student中的index  ,Find the index in the student by address
    getStudentNameByAddress()
    getStudentNameById()
    getStudentInfByStuAddress()     // 通过stuAddress获取整个stu的信息

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// getter about course

    // about all course
    getIndexByCourseId              // 通过course id 得到此课程的索引   Get the index of this course by course ID
 
    getAllCourseId()                // 返回当前所有的course id

    getcourseStudentCounts          // 得到course id的学生人数  The number of students to get the course ID

    getCourseCounts()               // 返回当前的courseCounts的值  Return the current courseCounts value

    getCourseStudentsByCourseId()   // 得到指定course id下的所有学生信息

    getCourseInfByCourseId()        // 得到指定course id下的所有信息

    getTopStudentsByCourseId()      // 得到指定course id下的成绩排名前n名的学生


    // pro
    getCourseCountsByProAddress()   // 获得某个教师开了几门课  Get a few courses taught by a certain teacher

    getCourseIdByProAddress()       // 通过proAddress获得某个教师开的所有课程id的数组   Get an array of all course IDs opened by a teacher through proAddress


    // stu
    getCourseCountsByStuAddress()   // 获得某个学生上了几门课

    getCourseIdByStuAddress()       // 通过stuAddress获得某个学生参加的所有课程id的数组   Get an array of all course IDs opened by a student through stuAddress



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

4.3. check function

    checkIdExisted()                // 验证此id是否已经使用过了         Verify that this ID has been used

    checkAddressExisted()           // 验证是否此address已经使用过了    Verify that this address has been used

    ////// check course

    checkCourseCanApply             // 通过course id 检查是否可以申请此课程
                                    // Check the course ID to see if you can apply for this course

    checkCourseExisted              // 通过course id 检查此课程是否存在
                                    // Check if this course exists by course ID

    checkCourseHeldByProBlockAddress        // 通过courseId,proBlockAddress 检查教授是否拥有此门课程
                                            // Check whether the professor owns the course through courseId,proId

    checkCourseHeldByStuBlockAddress        // 通过courseId,stuBlockAddress 检查学生是否拥有此门课程
                                            // Through courseId,stuId checks whether the student owns the course

    
*/



contract StructAndModifiers{

    address public modifiersOwner;   // 

    constructor() {
        modifiersOwner = msg.sender;
        adminSelfs[1] = AdminSelf(1,'Root',modifiersOwner,3);
        adminCounts++;
    }

//// Struct

    ////////////
    // admin //
    ///////////
    uint public adminCounts = 0; //
    struct AdminSelf{
        uint adminId;               // 
        string adminName;           //
        address adminBlockAddress;  // 
        uint adminAuthorization;    // = 3
    }
    mapping(uint => AdminSelf)public adminSelfs; //
    
    ///////////////
    // professor //
    ///////////////
    uint public professorCounts = 0; //
    struct ProfessorSelf{
        uint proId;               // 
        string proName;           //
        address proBlockAddress;  // 
        uint proAuthorization;    // = 2
        uint[] myProCourses;          // 保存自己创建的课   Save the class you created
        // 判断是否正在教学, 正在教学的老师不能被随意剥夺权限   
        // 当老师每创建一门课程之后, 当有每有一名学生申请时+1 
        // 当老师给学生一门课程的成绩时,表明一门课程结束,则-1   
        // 为0时表示没有讲授一门课程
        // 初始为0
        /* 
            Judge whether the teacher is teaching, and the teacher who is teaching cannot be arbitrarily deprived of his authority,
            When the teacher creates a course, when each student applies, + 1
            When the teacher gives the student the score of a course, it indicates the end of a course, then - 1
            When it is 0, it means that no course is taught
            Initial 0
        */
        uint isTeachingPeopleSum;          
    }
    mapping(uint => ProfessorSelf)public professorSelfs; //
    
    /////////////
    // student //
    /////////////
    uint public studentCounts = 0; //
    struct StudentSelf{
        uint stuId;               // 
        string stuName;           //
        address stuBlockAddress;  // 
        uint stuAuthorization;    // = 1
        uint[] myStuCourses;      // 保存自己修的课 Save the lesson I'm taking
        //string[] myStuCourseNames;
        //uint[] myStuCoursesGrades;
        // 判断是否正在上课, 正在上课的学生不能呗随意剥夺权限
        // 当学生每加入一门课程时会+1,当学生每得到一门成绩时,表明一门课程结束 则-1
        // 为0时表示没有学习一门课程
        // 初始为0
        /*
            Judge whether students are in class. Students in class cannot be removed at will
            When students join a course, they will + 1. When students get a grade, it means that a course ends, then - 1
            If it is 0, it means that you have not studied a course
            Initial 0
        */
        uint isLearningSum;         
    }
    
    mapping(uint => StudentSelf)public studentSelfs; // 
    
    /*
    /////////////
    // course  //
    /////////////
    
    1. 记录课程信息                      Record course information
    2. 记录成绩信息(只有老师可以修改)    Record score information (only teachers can modify it)
    
    
    */
    
    uint public courseCounts = 0;
        
    //课程学生信息  Course student information
    struct CourseStudent{
        address stuBlockAddress;
        uint stuId;
        //string stuName;
        uint stuGrade;
    }

    //课程信息 Course information
    struct CourseInf{
        uint courseId;          //课程号
        string courseName;      //课程名称
        string profName;
        address proBlockAddress;
        bool canApply;          // 是否可以申请课程, 当有学生拿到成绩之后学生不可以申请此课程
        uint gotStudentGradeCounts;
        uint courseStudentCounts;  // 保存这门课下面的学生人数
        mapping (uint => CourseStudent) courseStudents;  // 保存修这门课的学生的数组
    }
    
    mapping (uint => CourseInf) public courseInfs;//Course information index
    
    

//////////////////////////////////////////////////////////////  
//////////////////////////////////////////////////////////////  
/////////////////////////////// modifier function
    
    // onlyAdmin
    modifier onlyAdmin() {
        bool isAdmin = false;
        for (uint256 i = 0; i <= adminCounts; i++) {
            if(msg.sender == adminSelfs[i].adminBlockAddress){                
                isAdmin = true;
            }
        }
        require(isAdmin,">>>>>>isAdmin = false");
        _;
    }

    
    // onlyProfessor
    modifier onlyProfessor() {
        bool isProfessor = false;
        for (uint256 i = 0; i <= professorCounts; i++) {  
            if(msg.sender == professorSelfs[i].proBlockAddress){               
                isProfessor = true;
            }
        }
        require(isProfessor,"isProfessor = false");
        _;
    }
/*   
    // 查看是否是学生
    function checkIsStudent(address _stuBlockAddress) internal view returns(bool){
        for (uint i = 0; i <= studentCounts; i++) {   
            if( _stuBlockAddress == studentSelfs[i].stuBlockAddress){                
                return true;
            }
        }
        return false;
    }
*/    
    
  
//////////////////////////////////////////////////////////////  
//////////////////////////////////////////////////////////////  
///////////////////////////////  4.1. setter function


    // 设置course id的学生人数 Number of students setting course ID
    // 当学生加入课程的时候,调用一次  Call once when students join the course
    function setcourseStudentCounts(uint _courseid) internal {
        for(uint i=1;i<=courseCounts;i++){
            if(courseInfs[i].courseId == _courseid){
                courseInfs[i].courseStudentCounts++; //调用一次 ,加一个人  Call once, add one person
            }
        }
    }

    function getIdByAddress(address _address) public view returns(uint){
        for(uint i=1;i<=adminCounts;i++){
            if(adminSelfs[i].adminBlockAddress == _address)
                return adminSelfs[i].adminId;
        }
        for(uint i=1;i<=professorCounts;i++){
            if(professorSelfs[i].proBlockAddress == _address)
                return professorSelfs[i].proId;
        }
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuBlockAddress == _address)
                return studentSelfs[i].stuId;
        }
        return 0; //
    }
 
    function getStuAddressByStuId(uint _stuId) public view returns(address){
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuId == _stuId)
                return studentSelfs[i].stuBlockAddress;
        }
        return address(0x0);
        
    }

    function getAuthorizationByAddress(address _address) public view returns(uint){
        for(uint i=1;i<=adminCounts;i++){
            if(adminSelfs[i].adminBlockAddress == _address)
                return adminSelfs[i].adminAuthorization;
        }
        for(uint i=1;i<=professorCounts;i++){
            if(professorSelfs[i].proBlockAddress == _address)
                return professorSelfs[i].proAuthorization;
        }
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuBlockAddress == _address)
                return studentSelfs[i].stuAuthorization;
        }
        return 0; //
    }

    function getAdminIndexByAddress(address _adminBlockAddress) public view returns(uint){
        for(uint i=1;i<=adminCounts;i++){
            if(adminSelfs[i].adminBlockAddress ==_adminBlockAddress) {
                return i;  // 
            }    
        }
        return 0; // 
    }

    function getProfessorIndexByAddress(address _proBlockAddress) internal view returns(uint){
        for(uint i=1;i<=professorCounts;i++){
            if(professorSelfs[i].proBlockAddress ==_proBlockAddress) {
                return i;  // 
            }    
        }
        return 0; // 
    }

    function getProfessorNameByAddress(address _profAddr) internal view returns(string memory){
        for(uint i=1; i<=professorCounts; i++){
            if(professorSelfs[i].proBlockAddress == _profAddr) {
                return professorSelfs[i].proName; 
            }    
        }
        return 'null';      
    }

// getter about student

    function getStudentIndexByAddress(address _stuBlockAddress) internal view returns(uint){
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuBlockAddress ==_stuBlockAddress) {
                return i;  // 
            }    
        }
        return 0; // 
    }

    function getStudentNameById(uint _stuId) public view returns(string memory){
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuId == _stuId) {
                return studentSelfs[i].stuName; // 
            }    
        }
        return 'null';      
    }

    function getStudentGradeByCourseIdAndStuAddr(uint _courseId,address _stuAddress) public view returns(uint){
        uint courseIdx = getIndexByCourseId(_courseId);

        for(uint i = 1; i <= courseInfs[courseIdx].courseStudentCounts; i++){
            if( courseInfs[courseIdx].courseStudents[i].stuBlockAddress == _stuAddress){
                return courseInfs[courseIdx].courseStudents[i].stuGrade;
            }
        }
        return 0;
    }

    function getStudentInfByStuAddress(address _stuBlockAddress) public view returns(uint,string memory,address,uint,uint[] memory,uint[] memory ){
        uint stuIndex = getStudentIndexByAddress(_stuBlockAddress);

        uint stuId_ = studentSelfs[stuIndex].stuId;
        string memory stuName_ = studentSelfs[stuIndex].stuName;
        uint stuAuthorization_ = studentSelfs[stuIndex].stuAuthorization;
        uint[] memory myStuCourses_ = studentSelfs[stuIndex].myStuCourses;        
        uint[] memory myStuCoursesGrades_ = new uint[](myStuCourses_.length);

        for(uint i = 0; i < myStuCourses_.length; i++){
            myStuCoursesGrades_[i] = getStudentGradeByCourseIdAndStuAddr(myStuCourses_[i], _stuBlockAddress);
        }

        return (stuId_,stuName_,_stuBlockAddress,stuAuthorization_,myStuCourses_,myStuCoursesGrades_);
    }

    function getAllStudentAddress() public view returns(address[] memory){
        address[] memory allStudentAddress_ = new address[](studentCounts);
        for(uint i=1;i<=studentCounts;i++){
            allStudentAddress_[i-1] = studentSelfs[i].stuBlockAddress;
        }
        return allStudentAddress_;
    }

    function getIndexByCourseId(uint _courseId) public view returns(uint){
        uint indexOfCourseID = 0;
        for(uint i=1;i<=courseCounts;i++){
            if(courseInfs[i].courseId == _courseId){
                indexOfCourseID = i;
                return indexOfCourseID;
            }
        }
        return 0;
    }

    // 通过course id 得到此课程的course name
    function getCourseNameStatusById(uint _courseId) public view returns(string memory, bool){
        uint indexOfCourseID = getIndexByCourseId(_courseId);
        bool isCourseEnded= false;

        if(courseInfs[indexOfCourseID].courseStudentCounts != 0 && (courseInfs[indexOfCourseID].courseStudentCounts == courseInfs[indexOfCourseID].gotStudentGradeCounts)){
                isCourseEnded = true;
        }

        return (courseInfs[indexOfCourseID].courseName, isCourseEnded);
    }

    function getAllCourseId() public view returns(uint[] memory){
        uint [] memory allCourseId_ = new uint[](courseCounts);

        for(uint i=1; i<=courseCounts; i++){
            allCourseId_[i-1] = courseInfs[i].courseId;
        }

        return allCourseId_;
    }

    function getcourseStudentCounts(uint _courseid) public view returns(uint courseStudentCounts_){
        for(uint i=1;i<=courseCounts;i++){
            if(courseInfs[i].courseId == _courseid){
                return courseInfs[i].courseStudentCounts;
            }
        }
    }

    function getCourseInfByCourseId(uint _courseid) public view returns(uint,string memory, string memory, address,uint){
        uint courseIndex = getIndexByCourseId(_courseid);

        uint courseId_ = courseInfs[courseIndex].courseId;          
        string memory courseName_ = courseInfs[courseIndex].courseName;      
        string memory profName_ = courseInfs[courseIndex].profName;      
        address proBlockAddress_ = courseInfs[courseIndex].proBlockAddress;
        uint courseStudentCounts_ = courseInfs[courseIndex].courseStudentCounts;  

        return (courseId_,courseName_, profName_, proBlockAddress_, courseStudentCounts_);
    }

    function getCourseStudentInfByCourseId(uint _courseid) public view returns(uint[] memory,address[] memory,uint[] memory){
        uint courseIndex = getIndexByCourseId(_courseid);
        uint courseStudentCounts_ = courseInfs[courseIndex].courseStudentCounts;  
        address[] memory stuAddressTemp = new address[](courseStudentCounts_); 
        uint[] memory stuIdTemp = new uint[](courseStudentCounts_); 
        uint[] memory stuGradeTemp = new uint[](courseStudentCounts_); 

        for(uint i=1;i<=courseStudentCounts_;i++){
            stuAddressTemp[i-1] = courseInfs[courseIndex].courseStudents[i].stuBlockAddress;
            stuIdTemp[i-1] = courseInfs[courseIndex].courseStudents[i].stuId;
            stuGradeTemp[i-1] = courseInfs[courseIndex].courseStudents[i].stuGrade;
        }

        return (stuIdTemp,stuAddressTemp,stuGradeTemp);
    }

    function getTopStudentsByCourseId(uint _courseid,uint _getTops) public view returns(uint,uint[] memory,address[] memory,uint[] memory){
        uint getTops = _getTops;
        uint gotGradeCounts = 0;
        uint courseIndex = getIndexByCourseId(_courseid);
        uint courseStudentCounts_ = courseInfs[courseIndex].courseStudentCounts;  
        if(courseStudentCounts_ < getTops){
            getTops = courseStudentCounts_;
        }
    
        uint[] memory gradeOfStuGradeSort = new uint[](courseStudentCounts_);
        for(uint i=1;i<=courseStudentCounts_;i++){
            if(courseInfs[courseIndex].courseStudents[i].stuGrade > 0){
                gradeOfStuGradeSort[i-1] = courseInfs[courseIndex].courseStudents[i].stuGrade;
                gotGradeCounts++;
            }  
        }

        if(gotGradeCounts < getTops){
            getTops = gotGradeCounts;
        }

        for(uint i=0;i<gradeOfStuGradeSort.length;i++){ 
            for(uint j=1;j<gradeOfStuGradeSort.length;j++){ 
                if(gradeOfStuGradeSort[j] > gradeOfStuGradeSort[j-1]){
                    uint temp = gradeOfStuGradeSort[j-1];
                    gradeOfStuGradeSort[j-1] = gradeOfStuGradeSort[j];
                    gradeOfStuGradeSort[j] = temp;
                }
            }
        }
        
        address[] memory stuAddressTemp = new address[](getTops);
        uint[] memory stuIdTemp = new uint[](getTops);  
        uint[] memory stuGradeTemp = new uint[](getTops); 

        uint flag = 0;
        for(uint i=0; i < gradeOfStuGradeSort.length; i++){
            if(flag == getTops){ 
                break;
            }
            stuGradeTemp[i] = gradeOfStuGradeSort[i];
            for(uint j=1;j<=courseStudentCounts_;j++){
                bool sameStudent = false;
                if(stuGradeTemp[i] == courseInfs[courseIndex].courseStudents[j].stuGrade){
                    for(uint k = 0; k < stuIdTemp.length; k++){
                        if(courseInfs[courseIndex].courseStudents[j].stuId == stuIdTemp[k]){
                            sameStudent = true;
                            break;
                        }
                    }

                    if(sameStudent == false){
                        stuIdTemp[i] = courseInfs[courseIndex].courseStudents[j].stuId;
                        stuAddressTemp[i] = courseInfs[courseIndex].courseStudents[j].stuBlockAddress;         
                    }
                }
            }
            flag++;
        }
        return (getTops,stuIdTemp,stuAddressTemp,stuGradeTemp);
    }

    function getCourseIdByProAddress(address _proBlockAddress) public view returns(uint[] memory){
        uint proIndex = getProfessorIndexByAddress(_proBlockAddress);
        uint courseLens = professorSelfs[proIndex].myProCourses.length;
        uint[] memory myProCoursesTemp = new uint[](courseLens); 

        for(uint i=0;i<courseLens;i++){
            myProCoursesTemp[i] = professorSelfs[proIndex].myProCourses[i];
        }
        return myProCoursesTemp;
    }  

    function checkAddressExisted(address _address) internal view returns(bool){
        for(uint i=1;i<=adminCounts;i++){
            if(adminSelfs[i].adminBlockAddress == _address)
                return true;
        }
        for(uint i=1;i<=professorCounts;i++){
            if(professorSelfs[i].proBlockAddress == _address)
                return true;
        }
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuBlockAddress == _address)
                return true;
        }
        return false; // 
    }


    ////// check course /////////////////

    function checkCourseCanApply(uint _courseId) internal view returns(bool){

        for(uint i=1;i<=courseCounts;i++){
            if(courseInfs[i].courseId == _courseId){
                if(courseInfs[i].canApply == true){
                    return true;
                }
            }
        }
        return false;
    }

    function checkCourseExisted(uint _courseId) internal view returns(bool){
        for(uint i=1;i<=courseCounts;i++){
            if(courseInfs[i].courseId == _courseId){
                return true;
            }
        }
        return false;
    }
    
    function checkCourseHeldByStuBlockAddress(uint _courseId,address _stuBlockAddress) internal view returns(bool){
        for(uint i=1;i<=studentCounts;i++){
            if(studentSelfs[i].stuBlockAddress == _stuBlockAddress){
                // Check whether the corresponding courseid exists in the mystucourses array under this stuid
                for(uint k=0;k<=studentSelfs[i].myStuCourses.length;k++){
                    if(studentSelfs[i].myStuCourses[k] == _courseId){
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

