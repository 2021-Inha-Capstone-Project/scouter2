// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


/*

// professor类 继承(inherit)StructAndModifiers, Admin

// 此合约中的所有函数都标记为: onlyProfessor
// All functions in this contract are marked as: onlyprofessor
1. createCourse()               // 创建课程  Create course

2. applyCourse()                // 加入课程  Join the course

3. createCourseGrade()          // 创建成绩  Create grades

4. getGradeByProAddress()            // 查看科目的全体学生的成绩     View the grades of all students in the subject

5. getGradeByProProAddrAndStuAddr()    //  查看科目某个学生的成绩      View the grade of a student in a subject


*/


import "./Admin.sol";
contract Professor is Admin {
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //创建课程  只有老师有权限 Only teachers have permission to create courses
    function createCourse (uint _courseId, string memory _courseName,address _proBlockAddress) public onlyProfessor returns(bool){    
        // 检查地址是否匹配 Check whether the proid matches the address
        require(_proBlockAddress == msg.sender,">>>The proBlockAddress no match the current address!!!");
        
        // 检查创建的课程信息是否已经存在 Check whether the created course information already exists
        bool isExisted = checkCourseExisted(_courseId); 
        require(isExisted == false,">>>_courseId already existed!!!");
        
        // 由于onlyProfessor所以不用检查proBlockAddress的真实性了
        
        // 自增 Self increasing
        courseCounts ++;
        
        // 创建  初始化没有学生和成绩 Create initialization without students and grades
        courseInfs[courseCounts].courseId = _courseId;
        courseInfs[courseCounts].courseName = _courseName;
        courseInfs[courseCounts].proBlockAddress = _proBlockAddress;
        courseInfs[courseCounts].canApply = true;
        courseInfs[courseCounts].gotStudentGradeCounts = 0;
        
        // 创建成功之后需要将此course ID放到对应的教授的档案中
        // After successful creation, you need to put this course ID into the corresponding professor's file
        uint professorIndex = getProfessorIndexByAddress(_proBlockAddress);
        // ID放到对应的教授的档案中 Put the ID in the corresponding professor's file
        professorSelfs[professorIndex].myProCourses.push(_courseId);  
        
        return true;
        
    }
    
    
     //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //加入课程  只有Professor有权限 Only professors have permission to join the course
    
    function applyCourse (uint _courseId,address _proBlockAddress,address _stuBlockAddress) public onlyProfessor returns(bool){
        
        // 检查_proBlockAddress与地址是否匹配 Check whether the proid matches the address
        //require(_proBlockAddress == msg.sender,">>>The proId no match the current address!!!");
        
        // 检查课程信息是否存在 Check whether the course information exists
        //bool isExisted = checkCourseExisted(_courseId); 
        //require(isExisted == true,">>>_courseId no existed!!!");
        
        // 检查此课程是否可以申请 Check whether this course can be applied
        bool canApply_ = checkCourseCanApply(_courseId);
        require(canApply_ == true,">>>canApply_ == false");
        
        // 检查教授是否拥有此门课程 Check whether the professor has this course
        //bool isheldByPro = checkCourseHeldByProBlockAddress(_courseId,_proBlockAddress);
        //require(isheldByPro == true,">>>professor does not own this course!!!");
              
        // 检查学生id的身份是否为学生 Check whether the student ID is a student
        //bool isStudent = checkIsStudent(_stuBlockAddress);
        //require(isStudent == true,">>>stuID is not a student!!!");
        
        // 创建成功之后需要将此student address放到对应的学生的档案中
        // After successful creation, you need to put this student ID into the corresponding student's file
        uint studentIndex = getStudentIndexByAddress(_stuBlockAddress);
        // 得到学生的姓名
        uint _stuId = studentSelfs[studentIndex].stuId;
        //string memory _stuName = studentSelfs[studentIndex].stuName;

        // ID放到对应的学生的档案中 Put the ID in the corresponding student's file
        // 此时检查是否有重复的course ID.  At this time, check whether there is a duplicate course ID
        bool repeated = false;
        for(uint i=0;i<studentSelfs[studentIndex].myStuCourses.length;i++){
            if(studentSelfs[studentIndex].myStuCourses[i]==_courseId){
                repeated = true;
            }
        }
        require(repeated == false,">>>>>>repeated = true");
        
        // 没有重复,可以申请  No duplication, can apply
        // 保存课程的id
        studentSelfs[studentIndex].myStuCourses.push(_courseId);

        // 先找到该门课程 ,将学生的信息放到对应的课程里面
        // First find the course and put the students' information into the corresponding course
        uint indexOfCourseID = getIndexByCourseId(_courseId);

        // 保存课程的名字
        //string memory courseName_ = courseInfs[indexOfCourseID].courseName;
        //studentSelfs[studentIndex].myStuCourseNames.push(courseName_);

        // 找到这门课下存储学生的数组的长度, 即 已经修这门课的学生人数
        // 新加入的学生将赋值到人数+1的位置上
        // 先将人数+1, 然后赋值给courseStudentCounts_  
        
        //Find the length of the array of students stored in this course, that is, the number of students who have taken this course
        //New students will be assigned to the position of number + 1
        //First assign the number of people + 1, and then assign it to coursestudentcounts_
        
        setcourseStudentCounts(_courseId);
        uint courseStudentCounts_ = getcourseStudentCounts(_courseId);    
        courseInfs[indexOfCourseID].courseStudents[courseStudentCounts_].stuBlockAddress = _stuBlockAddress;
        courseInfs[indexOfCourseID].courseStudents[courseStudentCounts_].stuId = _stuId;
        //courseInfs[indexOfCourseID].courseStudents[courseStudentCounts_].stuName = _stuName;

        // 每当有一名学生申请时,+1   // Whenever a student applies, + 1
        // isTeachingPeopleSum++
        uint professorIndex = getProfessorIndexByAddress(_proBlockAddress);
        professorSelfs[professorIndex].isTeachingPeopleSum += 1;
        
        // 设置学生正在上课   // Set students in class
        // isLearningSum++
        studentSelfs[studentIndex].isLearningSum += 1;
        
        return true;
        
    }
    
    
    // 创建成绩(onlyprofessor)  ==> 存到course类中
    // Create grade (onlyprofessor) = = > save to course class
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 创建成绩  只有老师有权限  Only teachers have permission to create grades
    // 需要 _courseId ,  _proBlockAddress , _stuBlockAddress, _stuGrade
    function createCourseGrade (uint _courseId,address _proBlockAddress,address _stuBlockAddress,uint _stuGrade) public onlyProfessor returns(bool){
        
        // 检查_proBlockAddress与地址是否匹配 Check whether the proid matches the address
        //require(_proBlockAddress == msg.sender,">>>The proId no match the current address!!!");
        
        // 检查课程信息是否存在 Check whether the course information exists
        //bool isExisted = checkCourseExisted(_courseId); 
        //require(isExisted == true,">>>_courseId no existed!!!");
        
        // 先检查教授是否是pro自己的课程  First check whether the professor is proid's own course
        //bool isheldByPro = checkCourseHeldByProBlockAddress(_courseId,_proBlockAddress);
        //require(isheldByPro == true,">>>professor does not own this course!!!");
        
        // check是否是stu自己的课程 Check is stuid's own course
        bool isheldByStu = checkCourseHeldByStuBlockAddress(_courseId,_stuBlockAddress);
        require(isheldByStu == true,">>>student does not own this course!!!");
        
        // 先找到该门课程 Find the course first
        uint indexOfCourseID = getIndexByCourseId(_courseId);
        // 找到这门课下存储学生的数组的长度, 即 修这门课的学生人数
        // Find the length of the array of students stored in this course, that is, the number of students taking this course
        uint courseStudentCounts_ = getcourseStudentCounts(_courseId);
        
        // 当有学生拿到成绩之后学生不可以申请此课程
        // Students can not apply for this course after they get their grades
        courseInfs[indexOfCourseID].canApply = false;

        // 在对应的课程下面找到对应的学生 赋予成绩
        // Find the corresponding students' grades under the corresponding courses
        for(uint j=1;j<=courseStudentCounts_;j++){
            if(courseInfs[indexOfCourseID].courseStudents[j].stuBlockAddress==_stuBlockAddress){
                // 信息匹配 ， 赋予成绩   Information matching, giving results
                if(courseInfs[indexOfCourseID].courseStudents[j].stuGrade == 0){
                    courseInfs[courseCounts].gotStudentGradeCounts++;
                }

                courseInfs[indexOfCourseID].courseStudents[j].stuGrade = _stuGrade;
                
                // 更新老师和学生的状态数  Update the status number of teachers and students
                uint professorIndex = getProfessorIndexByAddress(_proBlockAddress);
                uint studentIndex = getStudentIndexByAddress(_stuBlockAddress);
                
                if(professorSelfs[professorIndex].isTeachingPeopleSum != 0){
                    // isTeaching--
                    professorSelfs[professorIndex].isTeachingPeopleSum--;
                }
                if(studentSelfs[studentIndex].isLearningSum != 0){
                    // isLearning--
                    studentSelfs[studentIndex].isLearningSum--;
                }
                
                // 记录自己的成绩信息
                //studentSelfs[studentIndex].myStuCoursesGrades.push(_stuGrade);

                return true;    // 更新完毕 Update complete
            }
        }
        // 否则失败
        return false;  // 完毕 
        
    }
    
/*
    // 查看某门科目的全体学生的成绩  View the scores of all students in a subject
    // If it is a professor, it can view the scores of students in his course
    function getGradeByProAddress(uint _courseId, address _proBlockAddress) public view onlyProfessor returns(address[] memory, uint[] memory){
        
        // 检查proBlockAddress与地址是否匹配 Check whether the proid matches the address
        require(_proBlockAddress == msg.sender,">>>The proId no match the current address!!!");
        
        // 检查课程信息是否存在 Check whether the course information exists
        bool isExisted = checkCourseExisted(_courseId); 
        require(isExisted == true,">>>_courseId no existed!!!");
        
        
        // check是否是proId自己的课程 Check is proid's own course
        bool isheldByPro = checkCourseHeldByProBlockAddress(_courseId,_proBlockAddress);
        require(isheldByPro == true,">>>professor does not own this course!!!");
        
        ///
        // 会列出课程下所有学生的成绩 The results of all students under the course will be listed
        
        // 先找到该门课程 Find the course first
        uint indexOfCourseID = getIndexByCourseId(_courseId);
        
        // 找到这门课下存储学生的数组的长度, 即 修这门课的学生人数
        // Find the length of the array of students stored in this course, that is, the number of students taking this course
        uint courseStudentCounts_ = getcourseStudentCounts(_courseId);
              
        address[] memory myStudentAddress = new address[](courseStudentCounts_);
        uint[] memory myStudentsGrade  = new uint[](courseStudentCounts_);
              
        for(uint j=1;j<=courseStudentCounts_;j++){
            myStudentAddress[j-1] = courseInfs[indexOfCourseID].courseStudents[j].stuBlockAddress;
            myStudentsGrade[j-1] = courseInfs[indexOfCourseID].courseStudents[j].stuGrade;
        }    
        return (myStudentAddress,myStudentsGrade) ;  // 完毕 complete
          
    }

    
*/   


/*
    // 查看某门科目某个学生的成绩 View the results of a student in a subject
    function getGradeByProAddrAndStuAddr(uint _courseId,address _proBlockAddress,address _stuBlockAddress) public view onlyProfessor returns(uint){
        
        // 检查_proBlockAddress与地址是否匹配 Check whether the proid matches the address
        require(_proBlockAddress == msg.sender,">>>The proId no match the current address!!!");
        
        // 检查课程信息是否存在 Check whether the course information exists
        bool isExisted = checkCourseExisted(_courseId); 
        require(isExisted == true,">>>_courseId no existed!!!");
        
        // check是否是pro的课程 Check whether it is a course of proid
        bool isheldByPro = checkCourseHeldByProBlockAddress(_courseId,_proBlockAddress);
        require(isheldByPro == true,">>>professor does not own this course!!!");
        
        // check是否是stuId的课程 Check whether it is the course of stuid
        bool isheldByStu = checkCourseHeldByStuBlockAddress(_courseId,_stuBlockAddress);
        require(isheldByStu == true,">>>student does not own this course!!!");
        
        ///
        // 会列出自己的成绩 Will list their achievements 
        // 先找到该门课程  Find the course first
        uint indexOfCourseID = getIndexByCourseId(_courseId);
        
        // 找到这门课下存储学生的数组的长度, 即 修这门课的学生人数
        // Find the length of the array of students stored in this course, that is, the number of students taking this course
        uint courseStudentCounts_ = getcourseStudentCounts(_courseId);
            
        uint myCourseGrade;
        // 在对应的课程下面找到对应的学生  Find the corresponding student under the corresponding course
        for(uint j=1;j<=courseStudentCounts_;j++){
            if(courseInfs[indexOfCourseID].courseStudents[j].stuBlockAddress==_stuBlockAddress){
                // 信息匹配 ， get成绩 Information matching, get score
                myCourseGrade = courseInfs[indexOfCourseID].courseStudents[j].stuGrade;
                return myCourseGrade;    // 完毕 complete
            }
        }
        // 否则失败 Otherwise, it will fail
        return 0;  // 完毕 complete
        
    }
*/
    

                    

    
}




