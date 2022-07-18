import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { viewStyles, textStyles, boxStyles } from '../styles';
//import Clipboard from '@react-native-clipboard/clipboard';
import { images } from '../images';
import { styles } from '../styles';
import IconButton from '../components/IconButton';
import TextArea from '../components/TextArea';
import API from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const NoteScreen = ({ navigation, route }) => {

    const [noteId, setNoteId] = useState('');
    const [userId, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [copiedText, setCopiedText] = useState('');
    const [contents, setContents] = useState('');
    const [category, setCategory] = useState('');
    const [summary, setSummary] = useState('');

    const getNoteId = async () => {
        try {
            const note_id = AsyncStorage.getItem('note_id');
            setNoteId(note_id);
            console.log('getting note id successed' + noteId);
        } catch (e) {
            console.error(e);
        }
    }

    const getNotes = async () => {
        try {
            await API.get(
                `/notes/${noteId}`
            )
            .then(function (response) {
                if (response.data['success'] == true) {
                    setTitle(response.data.result[0]['title']);
                    setContents(response.data.result[0]['contents']);
                    setSummary(response.data.result[0]['summary']);
                    //setCategory(response.data.result[0]['category']);
                    console.log(title);
                    console.log(contents);
                    console.log(summary);
                    //console.log(category);
                }
            })
            .catch(function (error) {
                console.log(error.response);
            })
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        setUserId(route.params.userId);
        setCategory(route.params.categoryName);
        setNoteId(route.params.noteId);
        getNotes();
    }, [noteId]);

    const onBackPressed = () => {
        navigation.navigate('List', {
            categoryName: category,
            userId: userId
        });
    }

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(contents);
        console.log('copy');
        console.log(contents);
    }

    const fetchCopiedText = async () => {
        const text = await Clipboard.getStringAsync();
        console.log('text', text);
        setCopiedText(text);
        console.log(copiedText);
    };
    
    const _modify = () => {
        navigation.navigate('Modify', {
            categoryName: category,
            userId: userId,
            noteId: noteId
        });
    }

    const onDeletePressed = () => {
        navigation.navigate('List');
    }

    return (
        <View>
            <View style = {boxStyles.top}>
                <View style = {viewStyles.row}>
                    <IconButton
                        image = {images.back}
                        onPress = {onBackPressed}
                        marginLeft = {10}
                        marginTop = {60}
                    />
                    <Text style = {textStyles.title}>
                        {title}
                    </Text>
                    <View style = {{
                        alignItems: 'flex-end',
                        flexDirection: 'row'
                    }}>
                        <IconButton 
                            image = {images.modify}
                            onPress = {_modify}
                            marginLeft = {30}
                        />
                        <IconButton 
                            image = {images.copy}
                            onPress = {copyToClipboard}
                            marginLeft = {10}
                        />
                        <IconButton 
                            image = {images.delete_}
                            onPress = {onDeletePressed}
                            marginLeft = {10}
                        />
                    </View>
                </View>
            </View>

            <View style = {viewStyles.center}>
                <Text style = {textStyles.textArea}>{contents}</Text>
                <Text style = {textStyles.textArea}>{summary}</Text>
            </View>
            <View style = {viewStyles.row}>
                <Text style = {textStyles.hashtag}>#Hashtag</Text>
                <Text style = {textStyles.hashtag}>#Keyword</Text>
                <Text style = {textStyles.hashtag}>#Hashtag</Text>
            </View>
            <IconButton 
                            image = {images.copy}
                            onPress = {fetchCopiedText}
                            marginLeft = {10}
                        />
            <Text style = {textStyles.textArea}>{copiedText}</Text>
        </View>
    );
}

export default NoteScreen;