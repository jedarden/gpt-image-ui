# User Guide

This guide provides detailed instructions on how to use the GPT Image UI application, including the chat interface, image upload, image generation, and image editing features.

## Table of Contents

- [Getting Started](#getting-started)
- [Chat Interface](#chat-interface)
- [Working with Images](#working-with-images)
- [Image Viewing](#image-viewing)
- [Image Masking and Editing](#image-masking-and-editing)
- [Browser Storage](#browser-storage)
- [Tips for Effective Prompts](#tips-for-effective-prompts)
- [Troubleshooting](#troubleshooting)

## Getting Started

After [installing and setting up](2_installation_setup.md) the application, you can access it through your web browser.

1. Open your browser and navigate to the application URL:
   - In development mode: `http://localhost:3000`
   - In production: The URL where you've deployed the application

2. The application will load with the main chat interface visible.

## Chat Interface

The chat interface allows you to have conversations with the AI model, including sharing and discussing images.

### Sending Text Messages

1. Locate the message input area at the bottom of the chat container.
2. Type your message or prompt in the text field.
3. Press Enter or click the Send button to submit your message.
4. The message will appear in the chat history, and the AI will respond shortly.

### Chat History

- The chat history displays all messages in chronological order.
- Your messages appear on the right side (typically in blue).
- AI responses appear on the left side (typically in gray).
- Images are displayed inline within the chat.
- You can scroll up to view older messages.

### Message Status Indicators

Messages may display status indicators:
- **Sending**: The message is being sent to the server.
- **Delivered**: The message has been received by the server.
- **Error**: There was an error sending or processing the message.

### Clearing Chat History
### Clearing Chat History

If you want to start a fresh conversation:
1. Look for the Clear Chat button (typically in the control panel or settings).
2. Click the button to clear all chat history.
3. Confirm the action if prompted.

Note that clearing chat history will remove all messages from your browser's local storage.
## Working with Images

The application provides several ways to work with images in your conversations with the AI.

### Uploading Images

To upload an image from your device:

1. Locate the image upload button in the control panel (typically a camera or image icon).
2. Click the button to open the file selector.
3. Browse your device and select an image file (supported formats: JPEG, PNG, GIF).
4. The image will be uploaded and displayed in the preview area.
5. You can add a message to accompany the image if desired.
6. Click Send to include the image in the conversation.

Alternatively, you can drag and drop images directly into the message input area.

### Generating Images

To generate new images using AI:

1. Switch to image generation mode (look for a "Generate" button or similar).
2. Enter a detailed text prompt describing the image you want to create.
3. Configure generation options if available:
   - **Number of images**: How many variations to generate
   - **Size**: The dimensions of the generated images (or let AI determine the optimal size)
   - **Quality**: The level of detail (affects processing time)
   - **Background**: Whether to use a transparent background or not
4. Click the Generate button to start the process.
5. Wait for the generation to complete (this may take several seconds).
6. The generated images will appear in the chat.

#### Smart Parameter Selection

The application now uses AI to analyze your prompt and automatically determine the optimal parameters for your image:

- **Intelligent Size Selection**: The system will choose between portrait (1024x1792), landscape (1792x1024), or square (1024x1024) formats based on your prompt content.
- **Quality Optimization**: The system will select between standard and HD quality based on the level of detail required.
- **Background Analysis**: The system will determine if transparency would benefit your image based on the content.

You can still manually override these parameters if you have specific requirements.

### Image Options

Once an image is in the chat, you can interact with it:

- **View**: Click on the image to open it in the image viewer.
- **Save**: Look for a download button to save the image to your device.
- **Edit**: Select the edit option to modify the image using the masking tool.
- **Share**: Some deployments may offer options to share images.

## Image Viewing

The image viewer provides a better way to examine images in detail.

### Opening the Image Viewer

- Click on any image in the chat to open it in the viewer.
- The viewer will open as a modal overlay on the current page.

### Image Viewer Controls

- **Zoom**: Use the zoom controls or mouse wheel to zoom in and out.
- **Pan**: Click and drag to move around when zoomed in.
- **Rotate**: Use rotation controls if available.
- **Navigate**: If viewing multiple images, use arrow buttons to move between them.
- **Close**: Click the X button or press Escape to close the viewer.

### Image Information

The viewer may display additional information about the image:
- Dimensions
- File size
- Creation date
- Prompt used to generate the image (if applicable)

## Image Masking and Editing

The masking tool allows you to edit specific parts of an image using AI.

### Opening the Masking Tool

1. Find an image you want to edit in the chat.
2. Click on the image to open it in the viewer.
3. Select the Edit or Mask option from the viewer controls.
4. The masking tool interface will open.

### Creating a Mask

1. Use the brush tool to paint over the areas you want to edit.
   - White/colored areas will be edited.
   - Black/transparent areas will be preserved.
2. Adjust the brush size using the size slider.
3. Use the eraser tool to remove parts of the mask if needed.
4. The mask preview will show which areas will be affected.

### Editing with a Mask

1. After creating your mask, enter a text prompt describing what you want to change.
2. For example: "Replace with a red hat" or "Make this area look like a forest".
3. Click the Apply or Edit button to process the image.
4. Wait for the processing to complete.
5. The edited image will appear in the chat as a new message.

### Mask Controls

- **Brush Size**: Adjust the size of the brush tool.
- **Opacity**: Control the intensity of the brush (if available).
- **Invert**: Switch between masking and preserving areas.
- **Clear**: Remove the entire mask and start over.
- **Undo/Redo**: Step backward or forward through your changes.

## Browser Storage

The GPT Image UI application now stores all data locally in your browser using localStorage. This eliminates the need for user accounts or server-side storage.

### What is Stored Locally

The following data is stored in your browser:

1. **Chat Messages**: All conversations with the AI, including text messages and references to images
2. **Image Metadata**: Information about uploaded and generated images, including timestamps and prompts used
3. **User Settings**: Any customized settings you've configured for the application

### Storage Management

The application includes a Storage Manager component to help you manage your locally stored data:

1. **View Storage Usage**: See how much space is being used by chat history and images
2. **Export Data**: Save your chat history and image metadata to a JSON file for backup
3. **Import Data**: Restore previously exported data
4. **Clear Data**: Remove all stored data to free up space

To access the Storage Manager:
1. Look for the Storage or Data Management option in the control panel or settings
2. Click to open the Storage Manager interface

### Storage Limits

Browser localStorage has limitations that vary by browser:

| Browser | Typical Storage Limit |
|---------|----------------------|
| Chrome  | ~5-10MB              |
| Firefox | ~10MB                |
| Safari  | ~5MB                 |
| Edge    | ~10MB                |

The application manages these limits by:
- Limiting chat history to 5MB by default
- Limiting image metadata to 20MB by default
- Setting a total storage limit of 50MB by default

These limits can be adjusted in the application settings, but exceeding browser limits may cause data loss.

### Data Persistence

Important notes about browser storage:

- Data is stored only in the current browser on the current device
- Clearing browser data or cookies will erase your chat history and images
- Using private/incognito mode will not save data between sessions
- Different browsers (Chrome, Firefox, etc.) maintain separate storage

### Exporting and Importing Data

To back up your data:
1. Open the Storage Manager
2. Click "Export Data"
3. Choose a location to save the JSON file

To restore your data:
1. Open the Storage Manager
2. Click "Import Data"
3. Select your previously exported JSON file
4. Confirm the import when prompted

## Tips for Effective Prompts

The quality of your prompts greatly affects the results you get from the AI. Here are some tips for creating effective prompts:

### Text Prompts

- **Be Specific**: Provide clear, detailed descriptions.
- **Use Descriptive Language**: Include details about style, mood, colors, etc.
- **Specify Context**: Give background information when relevant.
- **Ask Follow-up Questions**: If the AI's response isn't what you expected, ask for clarification or refinement.

### Image Generation Prompts

- **Include Visual Details**: Describe colors, lighting, composition, style, etc.
- **Reference Art Styles**: Mention specific artists or art movements for stylistic guidance.
- **Specify Subject and Background**: Clearly describe both the main subject and its surroundings.
- **Mention Technical Aspects**: Include details like perspective, depth of field, or camera angle.

### Image Editing Prompts

- **Be Clear About Changes**: Specifically describe what should replace the masked area.
- **Maintain Consistency**: Ensure your edits will blend well with the rest of the image.
- **Consider Lighting and Perspective**: Mention these aspects to help the AI match the existing image.
- **Start Simple**: For complex edits, try making incremental changes rather than one big change.

### Example Prompts

#### Text Conversation
- "Can you explain how neural networks process images?"
- "What are the key differences between Renaissance and Baroque art styles?"

#### Image Generation
- "A serene mountain lake at sunset with snow-capped peaks reflected in the still water, in the style of Bob Ross."
- "A futuristic cityscape with flying vehicles and neon lights, cyberpunk style, dramatic lighting."

#### Image Editing
- "Replace the background with a tropical beach scene."
- "Change the color of the shirt from blue to red while maintaining the same texture and lighting."

## Troubleshooting

### Common Issues

#### Messages Not Sending
- Check your internet connection.
- Verify that the server is running.
- Look for error messages in the application.

#### Images Not Uploading
- Ensure the image is in a supported format (JPEG, PNG, GIF).
- Check that the file size is within limits (typically under 10MB).
- Try a different browser if the issue persists.

#### Poor Image Generation Results
- Revise your prompt to be more specific and detailed.
- Try different styles or approaches in your description.
- Check that your OpenAI API key has access to the gpt-image-1 model.

#### Masking Tool Issues
- Ensure you're using the correct brush size for your edits.
- Make sure the mask clearly defines the areas you want to change.
- Try simpler edits first to ensure the tool is working correctly.

### Getting Help

If you encounter issues not covered in this guide:
- Check the console for error messages (press F12 in most browsers).
- Review the [API Reference](4_api_reference.md) for endpoint details.
- Consult the [Developer Guide](5_developer_guide.md) for technical information.
- Contact the support team or raise an issue in the project repository.