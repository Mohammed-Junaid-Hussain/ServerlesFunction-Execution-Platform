import streamlit as st
import requests
import json
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

# API Configuration
API_URL = "http://localhost:3000/api"

st.set_page_config(page_title="Serverless Platform", layout="wide")
st.title("Serverless Function Platform")

# Sidebar navigation
page = st.sidebar.selectbox("Navigation", ["Functions", "Metrics"])

if page == "Functions":
    st.header("Function Management")
    
    # Function creation form
    with st.expander("Create New Function"):
        with st.form("new_function"):
            name = st.text_input("Function Name")
            language = st.selectbox("Language", ["python", "javascript"])
            code = st.text_area("Code")
            timeout = st.number_input("Timeout (ms)", min_value=1000, value=30000)
            virtualization = st.selectbox("Virtualization", ["docker", "firecracker"])
            
            submitted = st.form_submit_button("Create Function")
            if submitted:
                response = requests.post(f"{API_URL}/functions", json={
                    "name": name,
                    "language": language,
                    "code": code,
                    "timeout": timeout,
                    "virtualization": virtualization
                })
                if response.status_code == 201:
                    st.success("Function created successfully!")
                else:
                    st.error(f"Error creating function: {response.json().get('error')}")

    # List of functions
    st.subheader("Available Functions")
    response = requests.get(f"{API_URL}/functions")
    if response.status_code == 200:
        functions = response.json()
        for func in functions:
            with st.expander(f"{func['name']} ({func['language']})"):
                st.code(func['code'], language=func['language'])
                
                # Function execution form
                with st.form(f"execute_{func['_id']}"):
                    input_data = st.text_area("Input (JSON)", "{}")
                    execute = st.form_submit_button("Execute")
                    
                    if execute:
                        try:
                            input_json = json.loads(input_data)
                            response = requests.post(
                                f"{API_URL}/executions/{func['_id']}", 
                                json={"input": input_json}
                            )
                            result = response.json()
                            
                            if result['success']:
                                st.success(f"Execution time: {result['executionTime']}ms")
                                st.json(result['result'])
                            else:
                                st.error(f"Execution failed: {result['error']}")
                        except json.JSONDecodeError:
                            st.error("Invalid JSON input")
                
                # Delete function button
                if st.button(f"Delete {func['name']}", key=f"delete_{func['_id']}"):
                    response = requests.delete(f"{API_URL}/functions/{func['_id']}")
                    if response.status_code == 200:
                        st.success("Function deleted successfully!")
                        st.experimental_rerun()
                    else:
                        st.error("Error deleting function")

else:  # Metrics page
    st.header("System Metrics")
    
    # Time range selector
    time_range = st.selectbox("Time Range", ["1h", "24h", "7d"])
    
    # System-wide metrics
    response = requests.get(f"{API_URL}/metrics/system?timeRange={time_range}")
    if response.status_code == 200:
        metrics = response.json()
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Executions", metrics['totalExecutions'])
        with col2:
            st.metric("Success Rate", f"{metrics['successRate']:.1f}%")
        with col3:
            st.metric("Avg. Execution Time", f"{metrics['averageExecutionTime']:.1f}ms")
        
        # Virtualization comparison
        st.subheader("Executions by Virtualization")
        virt_data = pd.DataFrame({
            'Technology': ['Docker', 'Firecracker'],
            'Executions': [
                metrics['executionsByVirtualization']['docker'],
                metrics['executionsByVirtualization']['firecracker']
            ]
        })
        fig = px.bar(virt_data, x='Technology', y='Executions')
        st.plotly_chart(fig)
    
    # Function-specific metrics
    st.subheader("Function Metrics")
    response = requests.get(f"{API_URL}/functions")
    if response.status_code == 200:
        functions = response.json()
        selected_function = st.selectbox(
            "Select Function",
            options=[f['_id'] for f in functions],
            format_func=lambda x: next(f['name'] for f in functions if f['_id'] == x)
        )
        
        if selected_function:
            response = requests.get(
                f"{API_URL}/metrics/functions/{selected_function}?timeRange={time_range}"
            )
            if response.status_code == 200:
                metrics = response.json()
                
                # Display aggregates
                agg = metrics['aggregates']
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Success Rate", 
                             f"{(agg['successfulExecutions'] / agg['totalExecutions'] * 100):.1f}%")
                with col2:
                    st.metric("Avg. Execution Time", f"{agg['averageExecutionTime']:.1f}ms")
                with col3:
                    st.metric("Avg. Memory Usage", f"{agg['averageMemoryUsage'] / 1024 / 1024:.1f}MB")
                
                # Plot execution times
                df = pd.DataFrame(metrics['metrics'])
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                fig = px.line(df, x='timestamp', y='executionTime', 
                            title='Execution Times Over Time')
                st.plotly_chart(fig) 