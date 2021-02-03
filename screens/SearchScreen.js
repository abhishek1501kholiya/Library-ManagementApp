import React from 'react'
import {View , Text , TextInput,FlatList,StyleSheet,TouchableOpacity} from 'react-native'
import db from '../Config'
export default class SearchScreen extends React.Component{
    constructor(){
      super();
      this.state={
          allTransactions:[],
          search:null,
          lastVisibleTransaction:''
      }
    }
    componentDidMount = async ()=>{
       const query = await db.collection('transactions').limit(10).get();
       query.docs.map(doc=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })

       })
     
    }
    fetchMoreTransaction = async()=>{
        if(this.state.search !== null){
            var text = this.state.search.toUpperCase();
            var enteredText = text.split('');
            if(text[0] === 'B'){
                const transaction = await db.collection('transactions').where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
                transaction.docs.map(doc=>{
                     this.setState({
                         allTransactions:[...this.state.allTransactions,doc.data()],
                         lastVisibleTransaction:doc
                     })
                })
              }else if(text[0]==='S'){
                  const transaction = await db.collection('transactions').where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
                  transaction.docs.map(doc=>{
                       this.setState({
                           allTransactions:[...this.state.allTransactions,doc.data()],
                           lastVisibleTransaction:doc
                       })
                  })
              }else{
                const transaction = await db.collection('transactions').startAfter(this.state.lastVisibleTransaction).limit(10).get();
                transaction.docs.map(doc=>{
                     this.setState({
                         allTransactions:[...this.state.allTransactions,doc.data()],
                         lastVisibleTransaction:doc
                     })
                })

              }

        }
    }
     searchTransactions = async(text)=>{
        var text = text.toUpperCase();
        var enteredText = text.split('');
     
        
        this.setState({
            allTransactions:[]
        })

        if(text[0] === 'B'){
          const transaction = await db.collection('transactions').where('bookId','==',text).get();
          transaction.docs.map(doc=>{
               this.setState({
                   allTransactions:[...this.state.allTransactions,doc.data()],
                   lastVisibleTransaction:doc
               })
          })
        }else if(text[0]==='S'){
            const transaction = await db.collection('transactions').where('studentId','==',text).get();
            transaction.docs.map(doc=>{
                 this.setState({
                     allTransactions:[...this.state.allTransactions,doc.data()],
                     lastVisibleTransaction:doc
                 })
            })
        }
    } 
    render(){
        return(
           
             <View style={styles.container}>
                 <View style={styles.searchBar}>
                   <TextInput style={styles.bar} placeholder="Enter Bookid or Studentid" onChangeText={(text)=>{
                       this.setState({
                           search:text
                       })
                   }}>
                   </TextInput>
                   <TouchableOpacity onPress={()=>{
                       this.searchTransactions(this.state.search)
  
                   }}
                   style={styles.searchButton}>Search</TouchableOpacity>
                 </View>

                 <FlatList data={this.state.allTransactions}
                     renderItem={({item})=>(
                       <View style={{borderBottomWidth:2}}>
                         <Text>{'BookId:'+ item.bookId}</Text>
                         <Text>{'StudentId:'+ item.studentId}</Text>
                         <Text>{'TransactionType:'+ item.transactionType}</Text>
                         <Text>{'Date:'+ item.date.toDate()}</Text>
                       </View>   
                     )}
                     keyExtractor={(item,index) =>index.toString()}
                     onEndReached={this.fetchMoreTransaction}
                     onEndReachedThreshold={0.7}
                 />
            </View>
                
               
           
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 30,
    },
    searchBar: {
      flexDirection: "row",
      height: 40,
      width: "auto",
      borderWidth: 0.5,
      alignItems: "center",
      backgroundColor: "grey",
    },
    bar: {
      borderWidth: 2,
      height: 30,
      width: 300,
      paddingLeft: 10,
    },
    searchButton: {
      borderWidth: 1,
      height: 30,
      width: 50,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "green",
    },
  });
  