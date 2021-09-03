import {StatusBar} from 'expo-status-bar'
import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, Image, Clipboard, Dimensions, ScrollView} from 'react-native'
import {Camera} from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Permissions from 'expo-permissions'
import * as ImageManipulator from 'expo-image-manipulator';

const { width } = Dimensions.get('window')
let camera = Camera
const noImage = require('./assets/no_image.png');
const Logo = require('./assets/logo.png')

export default function App(){
  const [startCamera, setStartCamera] = React.useState(false) // If camera taken
  const [cameraRef, setCameraRef] = React.useState(null)
  const [previewVisible, setPreviewVisible] = React.useState(false) // If a photo is taken go to preview photo page
  const [capturedImage, setCapturedImage] = React.useState(null)
  const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back) // front or back camera
  const [flashMode, setFlashMode] = React.useState('off') // flash mode
  const [getUri, setUri] = React.useState(null); // get Uri of taken photo
  const [visible, setVisible] = React.useState(false); // review photo in home page
  const [text, setText] = React.useState(null); // Predict text 

  //Open camera button
  const __startCamera = async () => {
    const {status} = await Camera.requestPermissionsAsync()
    console.log(status)
    if (status === 'granted') {
      setStartCamera(true)
      setPreviewVisible(false)
    } else {
      Alert.alert('Access denied')
    }
  }

  //Open gallery button
  const __ChoosePhoto = async () => {
    let status = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status.granted === true) {
      let photo = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
        base64: true
      });
      setStartCamera(false)
      //setCapturedImage(photo)
      //setUri(photo.uri) // get Photo URL
      setVisible(true)

      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 480, height: 640 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true}
      );
      setUri(manipResult.uri)
      let str_base64 = manipResult.base64
      // send photo to server and get predicted result
      fetch_function = async () => {
        const response = await fetch("http://service.aiclub.cs.uit.edu.vn/easy_ocr_service/api/predict",{
                        mode: 'no-cors',
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "url": "http://192.168.20.156:3001/api/predict",
                            "src":  JSON.stringify(str_base64),
                            "name": "fetch_image"
                            })
                        })
        let result = await response.json();
        result = result['text'];
        return result
      }
      let pred = await fetch_function()
      setText(pred)
    } else {
      alert('Permission to access camera roll is required!');
      return;
      }

  }

  //Take picture from camera
  const __takePicture = async () => {
    const options  = {quality:1, base64:true, }
    let photo = await cameraRef.takePictureAsync(options)
    console.log(photo)
    setPreviewVisible(true)
    //setStartCamera(false)
    setCapturedImage(photo)
    setUri(photo.uri)
  }

  // Return to home page (button on preview photo page)
  const __savePhoto = async () => {
    let photo = capturedImage
    //setUri(photo.uri)
    setStartCamera(false)
    setVisible(true)

    const src = photo['base64']
    // send photo to server and get predicted result
    fetch_function = async () => {
      const response = await fetch("http://service.aiclub.cs.uit.edu.vn/easy_ocr_service/api/predict",{
                      mode: 'no-cors',
                      method: "POST",
                      headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          "url": "http://192.168.20.156:3001/api/predict",
                          "src":  JSON.stringify(src),
                          "name": "fetch_image"
                          })
                      })
      let result = await response.json();
      result = result['text'];
      result = JSON.stringify(result); 
      return result
    }
    let pred = await fetch_function()
    setText(pred)
  }

  // Copy predicted text 
  const copyToClipboard = () => {
    Clipboard.setString(text)
  }

  // Retaken the photo (button on preview photo page)
  const __retakePicture = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
    __startCamera()
  }

  //set Flash for camera
  const __handleFlashMode = () => {
    if (flashMode === 'on') {
      setFlashMode('off')
    } else if (flashMode === 'off') {
      setFlashMode('on')
    } else {
      setFlashMode('auto')
    }
  }

  // set camera mode 
  const __switchCamera = () => {
    if (cameraType === 'back') {
      setCameraType('front')
    } else {
      setCameraType('back')
    }
  }

  const _rotate90andFlip = async () => {
    let resizeObj = {};
    if (capturedImage.height > capturedImage.width) {
      resizeObj = { height: 640 };
    } else {
      resizeObj = { width: 640 };
    }
    const manipResult = await ImageManipulator.manipulateAsync(
      getUri,
     [{ rotate: 90 }, { resize: resizeObj }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.PNG, base64: true}
    );
    setCapturedImage(manipResult);
    setUri(manipResult.uri);
  };


  return (
    <View style = {styles.photoStyle}>
      {/* check for camera open */}
      {/* if camera is opened */}
      {startCamera ? (
        <View
          style={{
            flex: 1,
            width: '100%'
          }}
        >
          {/* preview photo after shoot */}
          {previewVisible && capturedImage ? (
            <CameraPreview photo={capturedImage} savePhoto={__savePhoto} retakePicture={__retakePicture} rotate90andFlip={_rotate90andFlip}/>
          ) : (
            <Camera
              ratio={"16:9"}
              type={cameraType}
              flashMode={flashMode}
              style={{flex: 1,
              height: "75%"}}
              ref={ref => {
                setCameraRef(ref) ;
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  paddingVertical: 50,
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    left: '5%',
                    top: '10%',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <TouchableOpacity
                    onPress={__handleFlashMode}
                    style={{
                      backgroundColor: flashMode === 'off' ? '#000' : '#fff',
                      borderRadius: 50,
                      height: 25,
                      width: 25
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      ⚡️
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={__switchCamera}
                    style={styles.SwitchCamera}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      {cameraType === 'front' ? '🤳' : '📷'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    flexDirection: 'row',
                    flex: 1,
                    width: '100%',
                    padding: 20,
                    justifyContent: 'space-between'
                  }}
                >
                  <View
                    style={{
                      alignSelf: 'center',
                      flex: 1,
                      alignItems: 'center'
                    }}
                  >
                    <TouchableOpacity
                      onPress={__takePicture}
                      style={styles.CameraButton}
                    />
                  </View>
                </View>
              </View>
            </Camera>
          )}
        </View>
      ) : (
        // Home page
        <View
          style={styles.container}
        >{visible ? (
          //If a photo is save, review it on home page
          <View style= {{flexDirection: 'column',
                          height: 660,
                          width:'100%', 
                          backgroundColor:'white',
                          alignItems: 'center',
                          }}>
            <View>
                  <Image resizeMode="contain" 
                          style={{width: 70, height: 70,  marginVertical:10 }}
                          source={Logo}/>
            </View>
            <View style = {styles.imageContainer}>
              <Image resizeMode="contain"
                  style={{
                    marginVertical: 10,
                    width: '98%', 
                    height: 350,
                    backgroundColor: '#F2F2F2',
                  }}
                  source={{ uri: getUri }}
              />
            </View>
            <View>
              <TouchableOpacity onPress={copyToClipboard}
                            style={styles.CopyText}>
                <AntDesign name="copy1" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.TextContainer}>
                  <Text style={styles.Viewtext}> 
                    {text}
                  </Text>
            </ScrollView>
          </View>
      ) : 
          <View style={{flexDirection: 'column', justifyContent: 'center', alignItems:'center', width: '100%', backgroundColor:'white'}}>
            
              <Image resizeMode="contain" 
                    style={{width: 100, height: 100, backgroundColor:'white', marginTop:30}}
                    source={Logo}/>
            
            <Image style={{marginTop: 50}} 
                  source={noImage} />
          </View>}
          <View
           style={styles.ButtonArea}
          >
            <TouchableOpacity
              onPress={__startCamera}
              style={styles.camera}
            >
              {/* <Text
                style={styles.cameraText}
              >
                Take picture
              </Text> */}
              <AntDesign name="camera" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={__ChoosePhoto}
              style={styles.gallery}
            >
              {/* <Text
                style={styles.cameraText}
              >
                Choose photo from gallery
              </Text> */}
              <AntDesign name="picture" size={30} color="#18A0FB" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  )
}

const CameraPreview = ({photo, retakePicture, savePhoto, rotate90andFlip}) => {
  //console.log('sdsfds', photo)
  return (
    <View
      style={{
        backgroundColor: '#000',
        flex: 1,
        width: '100%',
        marginTop:30
      }}
    >
      <ImageBackground
        source={{uri: photo && photo.uri}}
        style={{
          flex: 1,
        }}
        size={{width: '100%', height: '100%'}}
      >
        <View style={{marginTop:20,
                      justifyContent: 'center'}}>
          <TouchableOpacity
              onPress={rotate90andFlip}
              style={styles.Rotate}
            >
              <Icon size={20} name="rotate-left" color="white" />
          </TouchableOpacity>

        </View>
      </ImageBackground>
      {/* <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end', 
          //alignItems: 'center',
          backgroundColor: 'red',
          marginTop:200
        }}
      > */}
        <View
          style={{
            flexDirection: 'row',
            //position: 'relative',
            justifyContent: 'space-between',
            padding: 20,
            marginTop: 20,
            backgroundColor: 'black',
            width: '100%',
          }}
        >
          <TouchableOpacity
            onPress={retakePicture}
            style={styles.Retake}
          >
            <AntDesign name="back" size={30} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={savePhoto}
            style={styles.Retake}
          >
            <AntDesign name="check" size={30} color="white" />
          </TouchableOpacity>
        </View>
      {/* </View> */}
    </View>
  )
}

//STYLING 
const styles = StyleSheet.create({
  photoStyle:{
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  container: {
    // flex: 1,
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // marginTop: 50,
    // paddingLeft: 30,
    // paddingRight: 30,
    // marginBottom: 30
    flex:1,
    flexDirection: 'column',
    marginTop:32,
    backgroundColor: '#F2F2F2',
    justifyContent: 'flex-start',
    //alignContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  imageContainer:{
    marginHorizontal: 20,
    backgroundColor: '#F2F2F2',
    width: '100%', 
    height: 370,
    alignItems: 'center',
    
  },
  CopyText:{
    borderStyle: 'solid',
    borderWidth: 1,
    borderBottomWidth:0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderColor:'#18A0FB',
    backgroundColor: '#18A0FB',
    width: 60,
    height: 30,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:-160,
  },
  TextContainer:{
    //flexDirection:'column',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#18A0FB',
    backgroundColor: '#F2F2F2',
    height: '100%',
    width: '94%',
    marginHorizontal:10
    //marginVertical: 20,

    //justifyContent: 'center',
    //alignItems: 'center',
  },
  Viewtext:{
    margin: 10,
    fontFamily: 'Roboto',
    fontSize: 16,
    
  },
  ButtonArea:{
    flexDirection: 'row',
    //position: 'relative',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 0,
    padding: 20,
    marginTop: 20,
    marginBottom:20
    },
  camera: {
    width: 120,
    borderRadius: 10,
    backgroundColor: '#18A0FB',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 20
  },

  gallery: {
    width: 120,
    borderRadius: 10,
    borderWidth:2,
    borderColor: '#18A0FB',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 20
  },
  // cameraText:{
  //   color: '#fff',
  //   fontWeight: 'bold',
  //   textAlign: 'center'
  // },
  SwitchCamera:{
    marginTop: 20,
    borderRadius: 50,
    height: 25,
    width: 25
  },
  CameraButton:{
    width: 70,
    height: 70,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: '#fff'
  },
  Retake:{
    width: 130,
    height: 40,
    alignItems: 'center',
    borderRadius: 4
  },
  Rotate:{ 
    width: 32, 
    height: 32, 
    backgroundColor: 'black',
    marginLeft:'85%',
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 50,
  }
}
)