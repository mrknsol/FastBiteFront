import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { askAI, addUserMessage, clearChatHistory } from '../../redux/reducers/aiRecommendationSlice';
import { fetchProductTags } from '../../redux/reducers/productTagsSlice';
import './AIProductChat.css';

export const AIProductChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const chatEndRef = useRef(null);

  const { chatHistory, status } = useSelector((state) => state.aiRecommendation);
  const { tags } = useSelector((state) => state.productTags);
  const isLoading = status === 'loading';

  useEffect(() => {
    if (isOpen && tags.length === 0) {
      dispatch(fetchProductTags());
    }
  }, [isOpen, dispatch, tags.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const getTranslatedTagName = (translations) => {
    if (!Array.isArray(translations)) return 'Unknown Tag';
    const currentLangTranslation = translations.find(t => t.languageCode === i18n.language);
    const englishTranslation = translations.find(t => t.languageCode === 'en');
    return currentLangTranslation?.name || englishTranslation?.name || 'Unknown Tag';
  };

  const renderProduct = (product) => (
    <div key={product.id} className="ai-chat__product">
      <h4>{product.name}</h4>
      {product.category && (
        <p>
          <span className="ai-chat__label">{t('ai.category')}:</span> 
          {product.category}
        </p>
      )}
      <p className="ai-chat__price">
        <span className="ai-chat__label">{t('ai.price')}:</span> 
        ${product.price.toFixed(2)}
      </p>
      {product.tags && product.tags.length > 0 && (
        <div className="ai-chat__tags">
          <span className="ai-chat__label">{t('ai.tags')}:</span>
          <div className="ai-chat__tags-container">
            {product.tags.map((tag, index) => (
              <span key={index} className="ai-chat__tag">
                {getTranslatedTagName(tag.translations)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    try {
      dispatch(addUserMessage(userInput));
      await dispatch(askAI({
        userInput: userInput.trim(),
        languageCode: i18n.language
      })).unwrap();
      setUserInput('');
    } catch (err) {
      console.error('Failed to get AI recommendation:', err);
    }
  };

  return (
    <div className="ai-chat-container">
      <button 
        className={`ai-chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('ai.button.label')}
      >
        {isOpen ? (
          <span className="ai-chat-button__icon">✕</span>
        ) : (
          <>
            <span className="ai-chat-button__icon">🤖</span>
            <span className="ai-chat-button__text">{t('ai.button.label')}</span>
          </>
        )}
      </button>

      <div className={`ai-chat-wrapper ${isOpen ? 'open' : ''}`}>
        <div className="ai-chat">
          <div className="ai-chat__header">
            <h2 className="ai-chat__title">{t('ai.title')}</h2>
            {chatHistory.length > 0 && (
              <button 
                onClick={() => dispatch(clearChatHistory())}
                className="ai-chat__clear-button"
              >
                {t('ai.clearChat')}
              </button>
            )}
          </div>

          <div className="ai-chat__history">
            {chatHistory.map((message, index) => (
              <div 
                key={index} 
                className={`ai-chat__message ${message.type}`}
              >
                <div className="ai-chat__message-content">
                  <p>{message.message}</p>
                  {message.products && message.products.length > 0 && (
                    <div className="ai-chat__products">
                      {message.products.map(renderProduct)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="ai-chat__input-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t('ai.input.placeholder')}
              disabled={isLoading}
              className="ai-chat__input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !userInput.trim()}
              className="ai-chat__submit"
            >
              {isLoading ? t('ai.sending') : t('ai.send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};