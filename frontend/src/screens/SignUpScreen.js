import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { textStyles, viewStyles, boxStyles } from '../styles';
import { images } from '../images';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import API from '../api';

const SignUpScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userData, setUserData] = useState(null);

    const onBackPressed = () => {
        navigation.navigate('SignIn');
    };

    const onConfirmPressed = async () => {
        console.log("Confirm");
        if (email == "" || username == "" || password == "") {
            alert('빈칸없이 다 입력해주세요😊');
        }

        const data = {
            email: email,
            username: username,
            password: password,
        }

        try {
            const response = await API.post(
                `/signup`,
                data
            )
            .then(function (response) {
                if (response.data['success'] == true) {
                    alert('회원가입되었습니다.');
                    setUserData(data);
                    navigation.navigate('SignIn');
                } else {
                    alert('중복된 아이디가 존재합니다.');
                }
            })
            .catch(function (error) {
                console.log(error.response);
            });
        } catch (error) {
            console.log(error);
        }
    }

	return (
    	<View>
            <View style = {boxStyles.top}>
                <Text style = {textStyles.title}>
                    Register
                </Text>
            </View>

            <View style = {viewStyles.container}>
                <View style = {{
                    marginTop: 100,
                }}>
                    <View style = {viewStyles.row}>
                        <Image source = {images.email} />
                        <CustomInput
                            value={email}
                            setValue={setEmail}
                            placeholder="E-mail address"
                        />
                    </View>
                    <View style = {viewStyles.row}>
                        <Image source = {images.nickname} />
                        <CustomInput
                            value={username}
                            setValue={setUsername}
                            placeholder="Nickname"
                        />
                    </View>
                    <View style = {viewStyles.row}>
                        <Image source = {images.password} />
                        <CustomInput
                            value={password}
                            setValue={setPassword}
                            placeholder="Password"
                            secureTextEntry
                        />
                    </View>
                </View>

                <View style = {{
                    marginTop: 200,
                }}>
                    <View style = {viewStyles.row}>    
                            <CustomButton
                                onPress = {onBackPressed}
                                text = "Back"
                            />
                        
                        <View style = {{
                            marginLeft: 100,
                        }}>
                            <CustomButton
                                onPress = {onConfirmPressed}
                                text = "Confirm"
                            />
                        </View>
                    </View>
                </View>
                
                
            </View>
        </View>
    );
}

export default SignUpScreen;