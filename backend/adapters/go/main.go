package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func ordersProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	defer r.Body.Close()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("read body error:", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	req, err := http.NewRequest(http.MethodPost, "http://localhost:3000/orders", bytes.NewReader(body))
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}

	// Preserve Content-Type header from incoming request if present
	if ct := r.Header.Get("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("read response error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}

	// Mirror response Content-Type if provided
	if ct := resp.Header.Get("Content-Type"); ct != "" {
		w.Header().Set("Content-Type", ct)
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func main() {
	http.HandleFunc("/orders", ordersProxy)
	_ = http.ListenAndServe(":8080", nil)
}
