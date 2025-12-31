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

	// Mirror response headers
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func menuProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	req, err := http.NewRequest(http.MethodGet, "http://localhost:3000/menu", nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
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
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func authMeProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	req, err := http.NewRequest(http.MethodGet, "http://localhost:3000/auth/me", nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
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
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func ordersTrackProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	target := "http://localhost:3000" + r.URL.Path
	if q := r.URL.RawQuery; q != "" {
		target += "?" + q
	}
	req, err := http.NewRequest(http.MethodGet, target, nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	respBody, _ := io.ReadAll(resp.Body)
	_, _ = w.Write(respBody)
}

func ssePassthrough(w http.ResponseWriter, r *http.Request, target string, withAuth bool) {
	if withAuth {
		// Forward auth headers when requested
	}
	req, err := http.NewRequest(http.MethodGet, target, nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if withAuth {
		if auth := r.Header.Get("Authorization"); auth != "" {
			req.Header.Set("Authorization", auth)
		}
		if cookie := r.Header.Get("Cookie"); cookie != "" {
			req.Header.Set("Cookie", cookie)
		}
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	if f, ok := w.(http.Flusher); ok {
		buf := make([]byte, 32*1024)
		for {
			n, err := resp.Body.Read(buf)
			if n > 0 {
				_, _ = w.Write(buf[:n])
				f.Flush()
			}
			if err != nil {
				break
			}
		}
	} else {
		_, _ = io.Copy(w, resp.Body)
	}
}

func ordersStreamProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	target := "http://localhost:3000" + r.URL.Path
	if q := r.URL.RawQuery; q != "" {
		target += "?" + q
	}
	ssePassthrough(w, r, target, false)
}

func adminMenuGetProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	req, err := http.NewRequest(http.MethodGet, "http://localhost:3000/admin/menu", nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(body)
}

func adminMenuAvailabilityProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	body, _ := io.ReadAll(r.Body)
	req, err := http.NewRequest(http.MethodPost, "http://localhost:3000"+r.URL.Path, bytes.NewReader(body))
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if ct := r.Header.Get("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func adminOrdersGetProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	req, err := http.NewRequest(http.MethodGet, "http://localhost:3000/admin/orders", nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func adminOrderStatusProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	body, _ := io.ReadAll(r.Body)
	req, err := http.NewRequest(http.MethodPost, "http://localhost:3000"+r.URL.Path, bytes.NewReader(body))
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if ct := r.Header.Get("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func adminInventoryAdjustProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	body, _ := io.ReadAll(r.Body)
	target := "http://localhost:3000" + r.URL.Path
	req, err := http.NewRequest(http.MethodPost, target, bytes.NewReader(body))
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if ct := r.Header.Get("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func adminInventoryUpdateProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	body, _ := io.ReadAll(r.Body)
	target := "http://localhost:3000" + r.URL.Path
	req, err := http.NewRequest(http.MethodPut, target, bytes.NewReader(body))
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if ct := r.Header.Get("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func adminAnalyticsProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	target := "http://localhost:3000" + r.URL.Path
	if q := r.URL.RawQuery; q != "" {
		target += "?" + q
	}
	req, err := http.NewRequest(http.MethodGet, target, nil)
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func kitchenStreamProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	target := "http://localhost:3000" + r.URL.Path
	if q := r.URL.RawQuery; q != "" {
		target += "?" + q
	}
	ssePassthrough(w, r, target, true)
}

func kitchenUpdateStatusProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	body, _ := io.ReadAll(r.Body)
	target := "http://localhost:3000" + r.URL.Path
	req, err := http.NewRequest(http.MethodPost, target, bytes.NewReader(body))
	if err != nil {
		fmt.Println("build request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	if ct := r.Header.Get("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}
	if auth := r.Header.Get("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}
	if cookie := r.Header.Get("Cookie"); cookie != "" {
		req.Header.Set("Cookie", cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("forward request error:", err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	for k, vals := range resp.Header {
		for _, v := range vals {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(respBody)
}

func main() {
	http.HandleFunc("/orders", ordersProxy)
	http.HandleFunc("/orders/", func(w http.ResponseWriter, r *http.Request) {
		// Dispatch to either track or stream based on suffix
		if r.URL.Path == "/orders" {
			ordersProxy(w, r)
			return
		}
		if len(r.URL.Path) > 0 && len(r.URL.Path) >= len("/orders/") {
			if r.Method == http.MethodGet && r.URL.Path[len(r.URL.Path)-len("/stream"):] == "/stream" {
				ordersStreamProxy(w, r)
				return
			}
		}
		ordersTrackProxy(w, r)
	})

	http.HandleFunc("/menu", menuProxy)

	http.HandleFunc("/auth/me", authMeProxy)

	http.HandleFunc("/admin/menu", adminMenuGetProxy)
	http.HandleFunc("/admin/menu/", adminMenuAvailabilityProxy)

	http.HandleFunc("/admin/orders", adminOrdersGetProxy)
	http.HandleFunc("/admin/orders/", adminOrderStatusProxy)

	http.HandleFunc("/admin/inventory/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && len(r.URL.Path) >= len("/admin/inventory/") && r.URL.Path[len(r.URL.Path)-len("/adjust"):] == "/adjust" {
			adminInventoryAdjustProxy(w, r)
			return
		}
		if r.Method == http.MethodPut {
			adminInventoryUpdateProxy(w, r)
			return
		}
		http.Error(w, "Not Found", http.StatusNotFound)
	})

	http.HandleFunc("/admin/analytics/", adminAnalyticsProxy)

	http.HandleFunc("/kitchen/stream", kitchenStreamProxy)
	http.HandleFunc("/kitchen/orders/", kitchenUpdateStatusProxy)

	fmt.Println("Go adapter listening on http://localhost:8080")
	_ = http.ListenAndServe(":8080", nil)
}
