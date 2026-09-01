# 实现一个简单的http(s) proxy

```go
package main

import (
	"io"
	"log"
	"net"
	"net/http"
)

func main() {
	server := &http.Server{
		Addr:    ":8080",
		Handler: http.HandlerFunc(proxyHandler),
	}

	log.Println("HTTP Proxy listening on :8080")

	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

func proxyHandler(w http.ResponseWriter, r *http.Request) {

	// HTTPS
	if r.Method == http.MethodConnect {
		handleConnect(w, r)
		return
	}

	// HTTP
	handleHTTP(w, r)
}

func handleHTTP(w http.ResponseWriter, r *http.Request) {

	targetURL := r.URL

	// 创建新的请求
	req, err := http.NewRequest(
		r.Method,
		targetURL.String(),
		r.Body,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 复制Header
	req.Header = r.Header.Clone()

	// 发给目标服务器
	resp, err := http.DefaultTransport.RoundTrip(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	defer resp.Body.Close()

	// 把目标服务器的Header返回给客户端
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}

	w.WriteHeader(resp.StatusCode)

	// 把相应Body返回给客户端
	io.Copy(w, resp.Body)
}

func handleConnect(w http.ResponseWriter, r *http.Request) {

	// 连接目标服务器
	targetConn, err := net.Dial("tcp", r.Host)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	defer targetConn.Close()

	// 获取客户端连接
	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
		return
	}

	clientConn, _, err := hijacker.Hijack()

	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}

	defer clientConn.Close()

	// 告诉客户端：隧道建立成功
	_, err = clientConn.Write(
		[]byte("HTTP/1.1 200 Connection Established\r\n\r\n"),
	)

	if err != nil {
		return
	}

	// 双向转发
	go io.Copy(targetConn, clientConn)
	io.Copy(clientConn, targetConn)
}

// curl -x http://192.168.3.129:8080 https://www.baidu.com

```
