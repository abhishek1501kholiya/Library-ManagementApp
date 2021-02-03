import React from 'react'
import {View,Text,TextInput,TouchableOpacity,KeyboardAvoidingView,Image,StyleSheet} from 'react-native'
import firebase from 'firebase'

export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            email:'',
            password:''
        }
    }
     login =  async (email,password)=>{
     if(email && password !== null && email !== '' && password!=='' ){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, password)
                 if(response){
                     this.props.navigation.navigate('Transaction')
                 }
            }catch(error){
                    var errorCode = error.code;
                switch(errorCode){
                    case 'auth/user-not-found':
                        alert('The user doesnot exist')
                        break;
                    case 'auth/invalid-email':
                        alert('The email is invalid')
                        break;
                    case errorCode:
                        alert('errorCode')
                        break;
                }
            };
            
        

        }else{
            alert('Kindly fill all the fields')
        }
     }
    render(){
        return(
         <KeyboardAvoidingView style={{alignItems:'center',alignSelf:'center',marginTop:50}}>
            <View>
                <Image  source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}/>
                <Text>Wili</Text>
            </View>
            <View>
                 <TextInput  style={styles.loginBox}  keyboardType={'email-address'} placeholder="email" onChangeText={(email)=>{this.setState({email:email})}}></TextInput>
                 <TextInput  style={styles.loginBox} secureTextEntry={true} placeholder="password" onChangeText={(password)=>{this.setState({password:password})}}></TextInput>
            </View>
            <View>
                <TouchableOpacity onPress={()=>{
                   this.login(this.state.email,this.state.password);
                }} 
                style={styles.button}>
                    <Text style={{fontWeight:'bold'}}>Login</Text>
                </TouchableOpacity>
            </View>
         </KeyboardAvoidingView>
        )
    }

      
      
} 
const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    },
    button:{
        height:30,
        width:90,
        borderWidth:1,
        marginTop:20,
        paddingTop:5,
        borderRadius:7,
        alignItems:'center'
    }
        
})