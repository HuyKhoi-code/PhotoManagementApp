import {StatusBar} from 'expo-status-bar'
import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, Image} from 'react-native'
import {Camera} from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as Permissions from 'expo-permissions'
let camera = Camera
const noImage = require('./assets/no_image.png')

export default function App(){
  const [startCamera, setStartCamera] = React.useState(false) // If camera taken
  const [cameraRef, setCameraRef] = React.useState(null)
  const [previewVisible, setPreviewVisible] = React.useState(false) // If a photo is taken
  const [capturedImage, setCapturedImage] = React.useState(null)
  const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back) // front or back camera
  const [flashMode, setFlashMode] = React.useState('off') // flash mode
  const [getUri, setUri] = React.useState(null); // get Uri of taken photo
  const [visible, setVisible] = React.useState(false); // review photo in home page

  const __startCamera = async () => {
    const {status} = await Camera.requestPermissionsAsync()
    console.log(status)
    if (status === 'granted') {
      setStartCamera(true)
    } else {
      Alert.alert('Access denied')
    }
  }
  const __ChoosePhoto = async () => {
    let status = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status.granted === true) {
      let photo = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
      });
      setStartCamera(false)
      //setCapturedImage(photo)
      setUri(photo.uri)
      setVisible(true)
    }
  }
  const __takePicture = async () => {
    let photo = await cameraRef.takePictureAsync()
    console.log(photo)
    setPreviewVisible(true)
    //setStartCamera(false)
    setCapturedImage(photo)
  }
  const __savePhoto = () => {
    let photo = capturedImage
    setUri(photo.uri)
    setStartCamera(false)
    setVisible(true)
  }
  const __retakePicture = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
    __startCamera()
  }
  const __handleFlashMode = () => {
    if (flashMode === 'on') {
      setFlashMode('off')
    } else if (flashMode === 'off') {
      setFlashMode('on')
    } else {
      setFlashMode('auto')
    }
  }
  const __switchCamera = () => {
    if (cameraType === 'back') {
      setCameraType('front')
    } else {
      setCameraType('back')
    }
  }

  return (
    <View style = {styles.photoStyle}>
      {/* check for camera open */}
      {startCamera ? (
        <View
          style={{
            flex: 1,
            width: '100%'
          }}
        >
          {/* preview photo after shoot */}
          {previewVisible && capturedImage ? (
            <CameraPreview photo={capturedImage} savePhoto={__savePhoto} retakePicture={__retakePicture} />
          ) : (
            <Camera
              type={cameraType}
              flashMode={flashMode}
              style={{flex: 1}}
              ref={ref => {
                setCameraRef(ref) ;
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: 'transparent',
                  flexDirection: 'row'
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
          // If a photo is save, review it on home page
          <Image resizeMode="contain"
              style={{
                  width: 400, height: 400, marginBottom: 40, backgroundColor: '#fcfcfc',
              }}
              source={{ uri: getUri }}
          />
      ) : <Image source={noImage} />}
          <View
           style={styles.ButtonArea}
          >
            <TouchableOpacity
              onPress={__startCamera}
              style={styles.camera}
            >
              <Text
                style={styles.cameraText}
              >
                Take picture
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={__ChoosePhoto}
              style={styles.camera}
            >
              <Text
                style={styles.cameraText}
              >
                Choose photo from gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  )
}

const CameraPreview = ({photo, retakePicture, savePhoto}) => {
  console.log('sdsfds', photo)
  return (
    <View
      style={{
        backgroundColor: '#000',
        flex: 1,
        width: '100%',
        height: '100%'
      }}
    >
      <ImageBackground
        source={{uri: photo && photo.uri}}
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            padding: 15,
            justifyContent: 'flex-end'
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <TouchableOpacity
              onPress={retakePicture}
              style={styles.Retake}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20
                }}
              >
                Re-take
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={savePhoto}
              style={styles.SavePhoto}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20
                }}
              >
                save photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

//STYLING 
const styles = StyleSheet.create({
  photoStyle:{
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  ButtonArea:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    padding: 20,
    },
  camera: {
    width: 130,
    borderRadius: 4,
    backgroundColor: '#14274e',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginBottom: 100,
    marginHorizontal: 20,
    padding: 20
  },
  cameraText:{
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
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
  SavePhoto:{
    width: 130,
    height: 40,
    alignItems: 'center',
    borderRadius: 4
  }
}
)