import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiManager from '../../apiManager';

const baseUrl = import.meta.env.VITE_API_URL;

export const askAI = createAsyncThunk(
  'ai/ask',
  async ({userInput}, { rejectWithValue }) => {
    try {
      const apiData = {
        Url: `${baseUrl}/api/v1/chat/predict`,
        Method: 'POST',
        Headers: {
          'Content-Type': 'application/json'
        },
        Data: {
          userInput: userInput
        }
      };

      const response = await ApiManager.apiRequest(apiData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  chatHistory: [],
  status: 'idle',
  error: null
};

const aiRecommendationSlice = createSlice({
  name: 'aiRecommendation',
  initialState,
  reducers: {
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    addUserMessage: (state, action) => {
      state.chatHistory.push({
        type: 'user',
        message: action.payload
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(askAI.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(askAI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chatHistory.push({
          type: 'ai',
          message: action.payload.message,
          products: action.payload.products
        });
      })
      .addCase(askAI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.chatHistory.push({
          type: 'error',
          message: 'Error occurred while fetching data.'
        });
      });
  }
});

export const { clearChatHistory, addUserMessage } = aiRecommendationSlice.actions;
export default aiRecommendationSlice.reducer; 