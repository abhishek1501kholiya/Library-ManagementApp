import React from 'react'
import {View , Text , TextInput,TouchableOpacity,StyleSheet,Image,KeyboardAvoidingView,ToastAndroid} from 'react-native'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from  'expo-permissions'
import * as  firebase from  'firebase'
import db from '../Config'


export default class BookTransactionScreen extends React.Component{
 constructor(){
     super()
     this.state = {
         BookId:'',
         hasCameraPermissions:null,
         scanned:false,
         scannedData:'',
         buttonState:'normal',
         StudentId:'',
         transactionMessage:''
     }
 }

    getCameraPermissions = async (id) =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status === "granted",
            buttonState:id,
            scanned:false
        })
       
    } 
    handleBarCodeScanned = async({type,data})=>{
         const ButtonState = this.state.buttonState
         if(ButtonState === 'BookId'){
            this.setState({
                scanned:true,
                buttonState:'normal',
                BookId: data
            })
         }
         else if(ButtonState === 'StudentId'){
            this.setState({
                scanned:true,
                buttonState:'normal',
                StudentId: data
            })
         }
         
    }

    initiateBookIssue = async()=>{
       db.collection("transactions").add({
          studentId:this.state.StudentId,
          bookId : this.state.BookId,
          date:firebase.firestore.Timestamp.now().toDate(),
          transactionType:'Issue'
       })

       db.collection("books").doc(this.state.BookId).update({
          bookAvailability:false
       })
   
        
       db.collection("students").doc(this.state.StudentId).update({
       numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
     })

    //alert('Book Issued')

    ToastAndroid.show('Book Issued',ToastAndroid.SHORT)
    //  this.setState({
    //    BookId:'',
    //    StudentId:''
    //  })
    }

    initiateBookReturn = async()=>{
      db.collection("transactions").add({
         studentId:this.state.StudentId,
         bookId : this.state.BookId,
         date:firebase.firestore.Timestamp.now().toDate(),
         transactionType:'Return'
      })

      db.collection("books").doc(this.state.BookId).update({
         bookAvailability:true
      })
  
       
      db.collection("students").doc(this.state.StudentId).update({
      numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
    })

 //   alert('Book Returned')
 ToastAndroid.show('Book Returned',ToastAndroid.SHORT)
    // this.setState({
    //   BookId:'',
    //   StudentId:''
    // })
   }
  checkStudentEligibilityForBookReturn = async ()=>{
     const transactionRef = await db.collection('transactions').where("bookId","==",this.state.BookId).limit(1).get()
     var isStudentEligible = ''
     transactionRef.docs.map(doc=>{
        var lastBookTransaction = doc.data()
        if(lastBookTransaction.studentId === this.state.StudentId){
           isStudentEligible = true
        }else{
          isStudentEligible=false
          alert('the book was not issued by this student')
          this.setState({
            StudentId:'',
            BookId:''
          })
        }

     })
    return isStudentEligible
  } 
  checkStudentEligibilityForBookIssue = async()=>{
      const studentRef = await db.collection('students').where("studentId","==",this.state.StudentId).get()
      var isStudentEligible = ''
      if(studentRef.docs.length === 0){
        alert('The given StudentId doesnot exist')
        this.setState({
          StudentId : '',
          BookId:''
        })
        isStudentEligible  = false
      }else {
         studentRef.docs.map(doc=>{
            var Student = doc.data()
            if(Student.numberOfBooksIssued < 2){
               isStudentEligible = true
               
            }else{
              isStudentEligible = false
              alert('The Student has already issued a book')
              this.setState({
                StudentId : '',
                BookId:''
              })
            }
         })
      }
      return isStudentEligible
  }
  checkBookEligibility = async()=>{
    const bookRef =  await db.collection('books').where("bookId","==",this.state.BookId).get();
    var transactionType = ''
    if(bookRef.docs.length === 0){
       transactionType = false
    }else{
       bookRef.docs.map(doc=>{
         var book = doc.data();
         if(book.bookAvailability){
           transactionType = "Issue"
         }else{
           transactionType = "Return"
         }
       })
    }
    return transactionType
  }
    handleTransaction = async()=>{
        // var transactionMessage;
        //  db.collection("books").doc(this.state.BookId).get()
        //  .then(doc=>{
        //     console.log(doc.data())
        //     var book = doc.data();
        //     if(book.bookAvailability){
        //        this.initiateBookIssue();
        //        transactionMessage = 'Book issued'
        //     }else{
        //       this.initiateBookReturn();
        //       transactionMessage = 'Book Returned'
              
        //     }
            
        //  })
        //  this.setState({
        //    transactionMessage : transactionMessage
        //  })
        var transactionType = await this.checkBookEligibility()
        if(!transactionType){
           alert('The book doesnot exist in the library')
           this.setState({
              BookId:'',
              StudentId:''
           })
        }else if (transactionType === 'Issue'){
           var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
           if(isStudentEligible){
             this.initiateBookIssue();
             alert('Book Issued')
           }
        }else{
          var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
          if(isStudentEligible){
             this.initiateBookReturn()
             alert('Book Returned to the Library')
          }
        }
    }
    render(){
    
        
        const hasCameraPermissions = this.state.hasCameraPermissions
        const Scanned = this.state.scanned
        const ButtonState = this.state.buttonState
        if(ButtonState !== "normal" && hasCameraPermissions){
             return (<BarCodeScanner onBarCodeScanned={Scanned ? undefined: this.handleBarCodeScanned} style={StyleSheet.absoluteFillObject}/>)
        }else if(ButtonState === 'normal'){
            return(
          
             <KeyboardAvoidingView style={styles.container} behavior={"padding"} enabled>
                    
                 <View>
                        <Image source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}/>    
                        <Text style={{textAlign:'center',fontWeight:'bold',marginBottom:50}}>Wili</Text>
                 </View> 
                  
                 <View style={styles.inputView}>

                    <TextInput placeholder="BookId" style={{width:150,height:35,borderWidth:1,borderColor:'black'}} onChangeText={(BookId)=>{this.setState({
                         BookId : BookId
                    })}} value={this.state.BookId}></TextInput> 
                                     
                    <TouchableOpacity onPress={()=>{this.getCameraPermissions('BookId')}} style={styles.scanButton}>
                        <Text style={{fontWeight:'bold'}}>Scan QR code</Text>
                    </TouchableOpacity>
                       
            </View>
             <View style={styles.inputView}>

             <TextInput placeholder="StudentId" style={{width:150,height:35,borderWidth:1,borderColor:'black'}} onChangeText={(StudentId)=>{this.setState({
                        StudentId : StudentId
                     })}} value={this.state.StudentId}></TextInput> 

                <TouchableOpacity onPress={()=>{this.getCameraPermissions('StudentId')}} style={styles.scanButton}>
                        <Text style={{fontWeight:'bold'}}>Scan QR code</Text>
                </TouchableOpacity>  

             </View>

             <TouchableOpacity onPress={async ()=>{ await this.handleTransaction()
               this.setState({
                  BookId:'',
                  StudentId:''
               })
            }} style={styles.submitButton}>
                    
                        <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>  

     
             </KeyboardAvoidingView>
            )
        }
      
    }
}

const styles = StyleSheet.create({

    container: {
 
 
      flex: 1,
 
 
      justifyContent: 'center',
 
 
      alignItems: 'center'
 
 
    },
 
 
    displayText:{
 
 
      fontSize: 15,
 
 
      textDecorationLine: 'underline'
 
 
    },
 
 
    scanButton:{
 
 
      backgroundColor: '#2196F3',
 
 
      padding: 10,
 
 
      margin: 10
 
 
    },
 
 
    buttonText:{
 
 
      fontSize: 15,
 
 
      textAlign: 'center',
 
 
      marginTop: 10
 
 
    },
 
 
    inputView:{
 
 
      flexDirection: 'row',
 
 
      margin: 20
 
 
    },
 
 
    inputBox:{
 
 
      width: 200,
 
 
      height: 40,
 
 
      borderWidth: 1.5,
 
 
      borderRightWidth: 0,
 
 
      fontSize: 20
 
 
    },
 
 
    scanButton:{
 
 
      backgroundColor: '#66BB6A',
 
 
      width: 50,
 
 
      borderWidth: 1.5,
 
 
      borderLeftWidth: 0
 
 
    },
 
 
    submitButton:{
 
 
      backgroundColor: '#FBC02D',
 
 
      width: 100,
 
 
      height: 50,
 
 
    },
 
 
    submitButtonText:{
 
 
      padding: 10,
 
 
      textAlign: 'center',
 
 
      fontWeight: 'bold',
 
 
      fontSize: 20,
 
 
      color:'white'
 
 
    },
 
 
  });
 
 