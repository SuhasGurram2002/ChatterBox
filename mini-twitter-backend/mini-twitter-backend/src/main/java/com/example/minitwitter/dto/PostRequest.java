package com.example.minitwitter.dto;

import java.util.ArrayList;
import java.util.List;

public class PostRequest {
    private String content;
    private List<String> hashtags = new ArrayList<>();

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<String> getHashtags() { return hashtags; }
    public void setHashtags(List<String> hashtags) { this.hashtags = hashtags; }
}