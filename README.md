_**--Team Details--**_

**Team Code:** C3G5

**Members:** CHANG ZI KAI, LEE EARN HUI, LEE MIN MING, LEE WIE JIE, YONG PARK KEI

_**--Topic--**_

Healthy Trip Advisor: AI-Powered Urban Travel Safety System (SDG 3– Good Health & Well-Being)

_**--Problem Statement--**_

Rapid urban development has led to declining air quality and increasing traffic congestion, exposing residents to significant health risks especially for vulnerable groups. 
Although real-time air pollution and traffic datasets are available, they remain separate, lacking integration into a unified system capable of effectively assessing environmental health conditions. 
These limitations reduce the efficiency of decision-making for both the public and city planners. 
Therefore, this website addresses the lack of a real-time, data-driven framework by developing an AI-based solution that combines air quality, traffic, and health data to generate a health suitability index and provide alerts when conditions become unsafe.

_**--Target Users--**_

Our target users include the general public, everyone has the accessibility to the website to view the index data. 
We specifically focus on vulnerable groups such as infants, the elderly, and individuals with respiratory or cardiovascular conditions, as they are at higher risk during periods of poor air quality or heavy traffic congestion. 
Additionally, we aim to support city planners and government agencies in identifying high-risk areas . 
With real-time information, these agencies can develop targeted solutions and policies to protect public health.

_**--Solution Summary--**_

**Overview:** This website features an AI-driven, real-time system that integrates the city’s air quality and traffic congestion indices for any location entered by the user. 
The AI agent which operates in the backend of the website provides users with the latest index data along with recommendations on travel suitability and relevant alerts. 
Additionally, an optional chatbox allows users to ask questions, with the AI agent generating tailored solutions and suggestions in response.

**Key Components:**
1. Datasets
   
   The website retrieves real-time air quality and traffic congestion data from online sources, which serve as inputs for calculating the safety score.

2. Data Processing and Integration
   
   Collected datasets are first cleaned and standardized to ensure consistency.
   The processed datasets are then integrated into the algorithm for further computation.

   _Air Pollution Index (AQI):_

   The AQI values are obtained directly from AQICN api.
   Each AQI reading is compared against our predefined AQI categorisation table, which maps specific AQI ranges to a pollution score.
   This pollution score is then used as a component in calculating the safety score.
   <img width="469" height="163" alt="image" src="https://github.com/user-attachments/assets/a7d33e7d-f340-4d5e-9a6a-d3a6f6d23bc5" />

   _Traffic Index (TI):_

   Step1: Find Ratio

   Formula: ratio = Current Speed / Freeflow Speed
   
   _*Where Current Speed and Freeflow Speed is collected from the TomTom Traffic API_

   Definition:

   Freeflow Speed: This is the normal speed of the road when traffic is smooth, with no congestion
   
   Current Speed: This is the actual speed of vehicles right now on the selected road segment

   Step 2:
   
   With “ratio” determined, Congestion Percent is proceed with the below formula:
   <img width="608" height="113" alt="image" src="https://github.com/user-attachments/assets/ded81ac8-5993-4f9c-8452-436277a6165d" />

   If currentSpeed and freeFlowSpeed are available and the free‑flow speed is non‑zero, congestion is computed as the percentage reduction from normal speed:

   Step 3:

   With “Congestion Percent” determined, Traffic Health is proceed with the below formula:

   Traffic Health = 100 - Congestion Percent,  if Congestion Percent is not null

3. Results Generator

   The integrated datasets are processed by the algorithm and presented in real time on the website.
   Users can view the Urban Health Suitability Index, which indicates safety levels for different urban areas through intuitive visualizations.

   The safety score is calculated as follows:

   Safety score = (0.6 * Pollution Score) + (0.4 * TI)

   <img width="676" height="210" alt="image" src="https://github.com/user-attachments/assets/798d8e76-994b-45ee-8ffd-a192b66180a7" />

4. Alert Module

   In this system, alert messages are generated on-demand. When a user searches for a specific city, the analysis of the latest environmental data will be displayed.
   These alerts reflect current conditions such as haze or pollution levels that may affect the general population or vulnerable groups.
   This ensures that users can access the latest status instantly upon searching a city or location, providing data-driven insights tailored to the area they choose to view.

5. AI Agent Module

   The AI agent acts as an intelligent intermediary that automates data interpretation and user guidance.
   It analyzes processed datasets and determines the health suitability level for area prompts by the user.
   The agent also assists in generating personalized recommendations, responding to user queries, and supporting decision-making with adaptive, context-aware insights.
   This module enhances system automation, reduces manual intervention, and provides users with more accurate and timely information.

_**--Expected Output--**_

1. Location to Check

   - User inputs the location they wish to assess

2. AI Advice Input

   - Optional field where the user can enter a message or question for the AI agent

3. Safety Score

   - Safety score calculated is displayed 

4. Overall advice

   - Displays predefined guidance corresponding to the safety score, as specified in the backend logic

5. AI Advice Output

   - AI-generated message based on the user’s input, combined with the calculated safety score that includes both traffic congestion and AQI

6. Air Quality Index (AQI)

   - Real-time AQI based on AQICN APIs

7. Traffic Congestion

   - Real-time congestion percentage using algorithm stated in TI (Traffic Index)

_**--Technologies Used--**_

_Backend: JavaScript, OpenAI AI Agent_

- The backend, built with JavaScript and integrated with the OpenAI AI Agent, handles user requests to provide environmental health advice. 
When a user sends a GET request with a location(and optionally a question), it first converts the location into latitude and longitude using the OpenStreetMap Nominatim API. 
It then fetches live air quality data from the AQICN API and traffic congestion data from the TomTom Traffic API, calculates a pollution health score and traffic health score, and combines them into an overall health score. 
Based on this score, it categorizes the location as Good, Moderate, Unhealthy for sensitive groups, or Very Unhealthy, providing detailed safety advice and a suitability flag. 
If the user includes a question, the backend also generates short, personalized guidance using OpenAI’s GPT-4o-mini model. 
The final response is returned as a JSON object containing all data points, health assessments, advice, and AI-generated.

_Frontend: TypeScript + React_

- The frontend is built with TypeScript and React and serves as the user interface for the Healthy Trip Advisor system. 
It allows users to enter a location, optionally ask a question for AI guidance, and view real-time safety information. 
The location input features autocomplete using OpenStreetMap Nominatim, with keyboard and mouse navigation, and a 300ms debounce to limit API calls. 
When a user clicks the “Get Safety Score & Advice” button, the frontend calls the backend /api/health endpoint with the selected location and optional question, then displays the results including overall health score, pollution and traffic data, detailed advice, AI-generated advice, and coordinates. 
The page also renders an interactive map using a MapComponent, highlighting the selected location. 

_Dataset source:_
  
  Pollution index (AQI): score extract from aqicn.org 

  Token: 2eb300711acd96c79b3f713d995f9b8c09e9c51c 

  URL: https://api.waqi.info/feed/@5780/token=2eb300711acd96c79b3f713d995f9b8c09e9c51c

  Traffic congestion index: score extract from Tom Tom Traffic API 

  Token: aBr6Gc2lAt690nSL9MwLhWTzPsgFIBfn

- The project uses two primary datasets for evaluating urban travel safety. 
The Pollution Index (AQI) is sourced from AQICN.org, providing real-time air quality measurements. 
Access is secured using the AQICN API token, and data is retrieved via the endpoint.
The Traffic Congestion Index comes from the TomTom Traffic API, offering live traffic flow and congestion data for specific coordinates.
Access is protected via the provided API key.
These datasets are combined to calculate a weighted health score and provide actionable safety advice for users.

_**--Instructions to Run the Prototype--**_

1. Ensure _Node.js_ is enabled on your system.

2. Open the Terminal and allow it to make changes to your device if prompted.

3. Navigate to the project directory:

   Locate your project folder and copy its full file path.

   Example: GitHub\C3G5_BUG_SourceCode\my-app

4. In the Terminal, enter the command:

   _cd 'file-path'_

   _*Replace 'file-path' with your actual project directory path._

5. Run the development server by entering:

   _npm run dev_

6. Once the server starts, open one of the following links in your browser:

   _http://localhost:3000/health-dashboard_

   _http://localhost:3001/health-dashboard_

7. The prototype should now be running and accessible in your browser.

_**--AI Usage Disclosure--**_

OpenAI supported this project by providing general guidance and technical assistance throughout the development process. 
ChatGPT was used to aid both frontend and backend development, including generating code, resolving errors, and improving overall development efficiency. 
With this support, initial ideas were effectively transformed into a functional product.
For real-time data integration, the system utilizes the AQICN API to retrieve live air quality readings and the TomTom Traffic API to obtain real-time traffic congestion information.
