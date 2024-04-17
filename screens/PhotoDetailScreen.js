import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
    collection,
    addDoc,
    doc,
  } from "firebase/firestore";
import { db } from "../config";


const PhotoDetailScreen = ({ route }) => {
  const { photoUri, photoName, photoDescription, eventId } = route.params;
  const [userId, setUserId] = useState(null);

  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      // Fetch user ID from AsyncStorage or wherever you store it
      // and update the state
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchCommentData = async () => {
      try {
        const photoDataRef = doc(db, `users/${userId}/events/${eventId}/photoArray`);
        const photoDataSnapshot = await getDoc(photoDataRef);
        if (photoDataSnapshot.exists()) {
          const photoData = photoDataSnapshot.data();
          setComments(photoData.comments || []);
        } else {
          console.error("Photo data document does not exist!");
        }
      } catch (error) {
        console.error("Error fetching photo data:", error);
      }
    };
    fetchCommentData();
  }, [userId, eventId]);
  

  const handleComment = () => {
    setShowCommentInput(true);
  };

  const handleLike = async () => {
    try {
      const newLikeCount = likeCount + 1;
      await addPhotoDataToFirestore({ likeCount: newLikeCount });
      setLikeCount(newLikeCount);
    } catch (error) {
      console.error("Error adding likes: ", error);
    }
  };
  
  const handleSubmitComment = async () => {
    try {
      const updatedComments = [...comments, commentText];
      await addPhotoDataToFirestore({ comments: updatedComments });
      setComments(updatedComments);
      setCommentText(""); // Clear comment input after submitting
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };
  

  const addPhotoDataToFirestore = async (data) => {
    try {
      await addDoc(collection(db, `users/${userId}/events/${eventId}/photoArray`), data);
      console.log("Data added successfully!");
    } catch (error) {
      console.error("Error adding data: ", error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.photo} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{photoName}</Text>
        <Text style={styles.description}>{photoDescription}</Text>

        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <TouchableOpacity onPress={handleLike}>
            <Icon name="heart-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={{ paddingRight: 40 }}>{likeCount} Likes</Text>
          <TouchableOpacity onPress={handleComment}>
            <Icon name="chatbubble-outline" size={27} color="black" />
          </TouchableOpacity>
          <Text style={{ paddingRight: 40 }}>{comments.length} Comments</Text>
        </View>

        {/* Render comments */}
        {comments.slice(0, showAllComments ? comments.length : 2).map((comment, index) => (
          <Text key={index} style={styles.commentText}>
            {comment}
          </Text>
        ))}

        {/* Show more comments button */}
        {!showAllComments && comments.length > 2 && (
          <TouchableOpacity onPress={() => setShowAllComments(true)}>
            <Text style={styles.showMoreButton}>Show More Comments</Text>
          </TouchableOpacity>
        )}

        {/* Render comment input field if showCommentInput is true */}
        {showCommentInput && (
          <View style={styles.commentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              onChangeText={(text) => setCommentText(text)}
              value={commentText}
            />
            <TouchableOpacity onPress={handleSubmitComment}>
              <Text style={styles.submitButton}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  photo: {
    flex: 0.4,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 0.6,
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  submitButton: {
    color: "blue",
    fontWeight: "bold",
  },
  commentText: {
    marginTop: 5,
    fontSize: 16,
  },
  showMoreButton: {
    color: "blue",
    marginTop: 10,
  },
});

export default PhotoDetailScreen;
