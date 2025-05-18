import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import WebView from "react-native-webview";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Props {
	gps_location?: string; // GPS location in "latitude,longitude" format
}

const BasestationMap: React.FC<Props> = ({ gps_location }) => {
	const [mapType, setMapType] = useState<"street" | "satellite">("street");
	
	// Function to parse GPS location string into coordinates
	const parseGPSLocation = (gpsString?: string): [number, number] | null => {
		if (!gpsString) return null;
		const [lat, lng] = gpsString.split(",").map(Number);
		return lat && lng ? [lat, lng] : null;
	};

	const coordinates = parseGPSLocation(gps_location);

	if (!coordinates) {
		return null;
	}

	const [lat, lng] = coordinates;

	// Toggle map type between street and satellite
	const toggleMapType = () => {
		setMapType(prev => prev === "street" ? "satellite" : "street");
	};

	// Get the appropriate tile layer URL based on map type
	const getTileLayerUrl = () => {
		return mapType === "street" 
			? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
	};

	// Get the appropriate attribution based on map type
	const getAttribution = () => {
		return mapType === "street" 
			? ''
			: '';
	};

	// HTML content for the WebView with dynamic tile layer
	const htmlContent = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
				<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
				<style>
					body { margin: 0; padding: 0; }
					#map { height: 100vh; width: 100vw; }
				</style>
			</head>
			<body>
				<div id="map"></div>
				<script>
					const map = L.map('map').setView([${lat}, ${lng}], 17);
					
					// Add the tile layer based on the selected map type
					const tileLayer = L.tileLayer('${getTileLayerUrl()}', {
						maxZoom: 19,
						attribution: '${getAttribution()}'
					}).addTo(map);
					
					// Add marker at the location
					L.marker([${lat}, ${lng}]).addTo(map)
						// .bindPopup("Location: ${lat}, ${lng}")
						.openPopup();
						
					// Handle messages from React Native
					window.addEventListener('message', function(event) {
						const message = JSON.parse(event.data);
						if (message.type === 'changeMapType') {
							// Remove current tile layer
							map.removeLayer(tileLayer);
							
							// Add new tile layer
							const newUrl = message.mapType === 'street' 
								? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
								: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
								
							const newAttribution = message.mapType === 'street'
								? ''
								: '';
								
							L.tileLayer(newUrl, {
								maxZoom: 19,
								attribution: newAttribution
							}).addTo(map);
						}
					});
				</script>
			</body>
		</html>
	`;

	// Reference to the WebView
	let webViewRef: WebView | null = null;

	// Function to send message to WebView
	const sendMessageToWebView = (message: any) => {
		if (webViewRef) {
			webViewRef.postMessage(JSON.stringify(message));
		}
	};

	// Handle map type toggle
	const handleMapTypeToggle = () => {
		const newMapType = mapType === "street" ? "satellite" : "street";
		setMapType(newMapType);
		sendMessageToWebView({
			type: 'changeMapType',
			mapType: newMapType
		});
	};

	return (
		<View style={styles.container}>
			<WebView
				ref={ref => (webViewRef = ref)}
				source={{ html: htmlContent }}
				style={styles.webview}
				scrollEnabled={false}
				onError={(syntheticEvent) => {
					const { nativeEvent } = syntheticEvent;
					console.warn('WebView error: ', nativeEvent);
				}}
			/>
			<TouchableOpacity style={styles.mapTypeButton} onPress={handleMapTypeToggle}>
				<Icon 
					name={mapType === "street" ? "satellite" : "map"} 
					size={24} 
					color="#fff" 
				/>
				<Text style={styles.mapTypeText}>
					{mapType === "street" ? "Satellite" : "Street"}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 300,
		width: "100%",
		borderRadius: 8,
		overflow: "hidden",
		position: "relative",
	},
	webview: {
		flex: 1,
	},
	mapTypeButton: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		borderRadius: 4,
		padding: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	mapTypeText: {
		color: "#fff",
		marginLeft: 4,
		fontSize: 12,
	},
});

export default BasestationMap;



