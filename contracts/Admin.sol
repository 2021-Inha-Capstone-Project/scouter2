// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/*
// admin  继承 StructAndModifiers

1. setPermission()  设置权限 ==> 权限设置暂定 0=student; 1=professor; 2=admin
    如果他被设置为1 , 则调用modifier类中的函数添加到student数组中 ,同时添加到student合约中
    如果他被设置为2 , 则调用modifier类中的函数添加到professor数组中 ,同时添加到professor合约中
    如果他被设置为3 , 则调用modifier类中的函数添加到admin数组中 ,同时添加到admin合约中

    If it is set to 1, call the function in the modifier class to add it to the student array and to the student contract at the same time
    If it is set to 2, call the function in the modifier class to add it to the professor array and to the professor contract at the same time
    If it is set to 3, call the function in the modifier class to add it to the admin array and add it to the admin contract at the same time

2. removePermission() 移除权限
    professor需要在没有教学任务, student需要没有上课的情况下允许被剥夺权限
    Professors need to be allowed to be deprived of permission without teaching tasks and students need to take classes


// 弃用中 : 3. getGradeByAdminId() 可以查看任意课程的学生成绩 You can view the student scores of any course


*/

import "./StructAndModifiers.sol";

contract Admin is StructAndModifiers{

    // onwer +1 初始化为1 是因为自动将root加入   Initialized to 1 because root is automatically added
    uint public personCounts = 1;   // 记录当前总人数 Record the current number of people
    // id值 ， 初始化id的值，自动累加  id value, initialize the id value, automatically accumulate
    uint setadmId = 1; // root = 1
    uint setproId = 100;    // proId从100开始设置
    uint setstuId = 1000;    
    
     ////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // 设置权限函数 Set permission function
    function setPermission(address _blockAddress,string memory _name,uint _authorization) public onlyAdmin returns(bool){
        
        // 检查设置的权限值是否合法  Check whether the set permission value is legal
        require(_authorization == 1 || _authorization == 2 || _authorization == 3, "unauthorized");
        
        // 检查此address是否存在  shuo ming yi jing she zhi guo le
        // true ==> 已经被设置过则不允许更改
        require(checkAddressExisted(_blockAddress) == false,"This address has already been set permissions");
        
        // Record person[]
        // 自增 Self increasing
        personCounts++;

        if(_authorization == 1){ // 
            // 直接把他加到学生中  Add him directly to the students
            studentCounts++;
            setstuId++;
            // 由于课程的数组此时没法赋值，所以采取一个一个赋值的方式 
            // Since the course array cannot be assigned at this time, it is assigned one by one
            studentSelfs[studentCounts].stuId = setstuId;
            studentSelfs[studentCounts].stuName = _name;
            studentSelfs[studentCounts].stuBlockAddress = _blockAddress;
            studentSelfs[studentCounts].stuAuthorization = 1;
            studentSelfs[studentCounts].isLearningSum = 0; // 初始化为没有正在上课 Initialize to no class in progress
            
        }
        else if(_authorization == 2){ // professor
            professorCounts++;
            setproId++;
            // 由于课程的数组此时没法赋值，所以采取一个一个赋值的方式
            // Since the course array cannot be assigned at this time, it is assigned one by one
            professorSelfs[professorCounts].proId = setproId;
            professorSelfs[professorCounts].proName = _name;
            professorSelfs[professorCounts].proBlockAddress = _blockAddress;
            professorSelfs[professorCounts].proAuthorization = 2;
            professorSelfs[professorCounts].isTeachingPeopleSum = 0; // 初始化为没有正在教学 Initialize to no teaching in progress

        }
        else if(_authorization == 3){ // Admin
            adminCounts++;
            setadmId++;
            adminSelfs[adminCounts] = AdminSelf(setadmId,_name,_blockAddress,3);

        }
        // 设置成功了  Setup succeeded
        return true;
       
        
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // 移除相对于的权限, 设置为100 , 即person  ;  Remove the permission relative to, and set it to 100, that is, person
    function removePermission(address _blockAddress) public onlyAdmin returns(bool){

        // 首先查找此ID是否存在                                     First find out if this ID exists
        require(checkAddressExisted(_blockAddress) == true,">>>This address no exist");
        
        // 然后检查此ID之前的权限为多少                             Then check the permission before this ID
        uint _authorization  = getAuthorizationByAddress(_blockAddress); // 调用函数得到index       Call function to get index
        require(_authorization != 0,">>>This blockAddress was originally not authorized");
        
        
        // 根据他的权限将他从相对应的权限数据库中移除  ;   Remove him from the corresponding permission database according to his permissions
        if(_authorization == 1){ // 
            uint studentIndex = getStudentIndexByAddress(_blockAddress);
            // 检查此ID是否正在学习  Check if this ID is learning
            require(studentSelfs[studentIndex].isLearningSum == 0,">>>This student is learning, cant remove permission!!!"); 
            
            // 直接删除会留出一个空位置  Direct deletion will leave an empty space
            // 所以将后一个元素覆盖前一个元素  So the latter element overwrites the previous element
            for(uint i=studentIndex;i<studentCounts;i++){
                studentSelfs[i].stuId = studentSelfs[i+1].stuId;
                studentSelfs[i].stuName = studentSelfs[i+1].stuName;
                studentSelfs[i].stuBlockAddress = studentSelfs[i+1].stuBlockAddress;
                studentSelfs[i].stuAuthorization = studentSelfs[i+1].stuAuthorization;
                studentSelfs[i].myStuCourses = studentSelfs[i+1].myStuCourses;
            }
            
            // 再把最后一个元素移除  Then remove the last element
            delete studentSelfs[studentCounts];
            studentCounts--; 
        }
        else if(_authorization == 2){  // professor
            uint professorIndex = getProfessorIndexByAddress(_blockAddress);
            // 检查此ID是否正在上课  Check if this ID is in class
            require(professorSelfs[professorIndex].isTeachingPeopleSum == 0,">>>This professor is teaching, cant remove permission!!!"); 
            
            // 直接删除会留出一个空位置  Direct deletion will leave an empty space
            // 所以将后一个元素覆盖前一个元素 So the latter element overrides the previous element
            for(uint i=professorIndex;i<professorCounts;i++){
                professorSelfs[i].proId = professorSelfs[i+1].proId;
                professorSelfs[i].proName = professorSelfs[i+1].proName;
                professorSelfs[i].proBlockAddress = professorSelfs[i+1].proBlockAddress;
                professorSelfs[i].proAuthorization = professorSelfs[i+1].proAuthorization;
                professorSelfs[i].myProCourses = professorSelfs[i+1].myProCourses;
            }
            
            // 再把最后一个元素移除 Then remove the last element
            delete professorSelfs[professorCounts];
            professorCounts--; 
 
        }
        else if(_authorization == 3){ // Admin
            uint adminIndex = getAdminIndexByAddress(_blockAddress);
            // 直接删除会留出一个空位置  Direct deletion will leave an empty space
            // 所以将后一个元素覆盖前一个元素  So the latter element overrides the previous element
            for(uint i=adminIndex;i<adminCounts;i++){
                adminSelfs[i].adminId = adminSelfs[i+1].adminId;
                adminSelfs[i].adminName = adminSelfs[i+1].adminName;
                adminSelfs[i].adminBlockAddress = adminSelfs[i+1].adminBlockAddress;
                adminSelfs[i].adminAuthorization = adminSelfs[i+1].adminAuthorization;
            }
            
            // 再把最后一个元素移除  Then remove the last element
            delete adminSelfs[adminCounts];
            adminCounts--; 

        }
        // 从person中删除
        personCounts--; 

        return true;
        
    }
    
/*    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 查看成绩  View results
    // 如果是admin, 那么它可以查看所有课程的所有学生的成绩 
    // If it is admin, it can view the scores of all students in all courses

    function getGradeByAdminAddr(uint _courseId,address _adminBlockAddress) public view onlyAdmin returns(address[] memory, uint[] memory){
        
        // 检查pid与地址是否匹配 Check whether the PID matches the address
        require(_adminBlockAddress == msg.sender,">>>The Id no match the current address!!!");
        
        // 检查课程信息是否存在 Check whether the course information exists
        bool isExisted = checkCourseExisted(_courseId); 
        require(isExisted == true,">>>_courseId no existed!!!");
        
        ///
        // 会列出课程下所有学生的成绩 The results of all students under the course will be listed
        
        // 先找到该门课程 Find the course first
        uint indexOfCourseID = getIndexByCourseId(_courseId);
        // 找到这门课下存储学生的数组的长度, 即 修这门课的学生人数
        // Find the length of the array of students stored in this course, that is, the number of students taking this course
        uint courseStudentCounts_ = getcourseStudentCounts(_courseId);
        
        address[] memory studentAddress = new address[](courseStudentCounts_);
        uint[] memory studentsGrade  = new uint[](courseStudentCounts_);
        
        // 这里会出现问题, 新创建的数组是从0开始, 而courseStudentCounts_是从1开始
        // There will be a problem here. The newly created array starts from 0 and coursestudentcounts_ It starts with 1
        for(uint j=1;j<=courseStudentCounts_;j++){
            studentAddress[j-1] = courseInfs[indexOfCourseID].courseStudents[j].stuBlockAddress;
            studentsGrade[j-1] = courseInfs[indexOfCourseID].courseStudents[j].stuGrade;
        }
        
        return (studentAddress,studentsGrade) ;  // 完毕 complete
     
    }

*/

}
