import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

export const fetchProductTags = createAsyncThunk(
  'productTags/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseUrl}/api/product/tags`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tags');
    }
  }
);

const initialState = {
  tags: [],
  status: 'idle',
  error: null
};

const productTagsSlice = createSlice({
  name: 'productTags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tags = action.payload;
        state.error = null;
      })
      .addCase(fetchProductTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const selectLocalizedTags = (state, language = 'en') => {
  return state.productTags.tags.map(tag => {
    const translation = tag.translations.find(t => t.languageCode === language)
                      || tag.translations.find(t => t.languageCode === 'en')
                      || tag.translations[0];

    return {
      value: tag.id,
      label: translation?.name || "Unnamed Tag"
    };
  });
};

export default productTagsSlice.reducer;