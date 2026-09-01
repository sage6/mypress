# socket proxy

```go
package main

import (
	"io"
	"log"
	"net"
)

const (
	listenAddr = ":9000"
	targetAddr = "192.168.3.129:80"
)

func main() {
	// 1. 监听本地端口
	listener, err := net.Listen("tcp", listenAddr)
	if err != nil {
		log.Fatal(err)
	}

	defer listener.Close()

	log.Println("socket proxy listening on", listenAddr)
	log.Println("target server:", targetAddr)

	for {
		// 接收客户端连接
		clientConn, err := listener.Accept()
		if err != nil {
			log.Println("accept error:", err)
			continue
		}

		log.Println("client connected:", clientConn.RemoteAddr())
		// 3. 为每个客户端连接使用一个goroutine
		go proxy(clientConn)
	}
}

func proxy(clientConn net.Conn) {
	defer clientConn.Close()

	// 4. 连接目标服务器
	targetConn, err := net.Dial("tcp", targetAddr)
	if err != nil {
		log.Println("connect target error:", err)
		return
	}

	defer targetConn.Close()

	log.Printf(
		"%s -> %s",
		clientConn.RemoteAddr(),
		targetAddr,
	)

	// 5. 客户端到目标服务器
	go func() {
		_, err := io.Copy(targetConn, clientConn)
		if err != nil {
			log.Println("client -> target", err)
		}

		// 通知目标服务器:
		// 客户端已经发送完数据
		if tcp, ok := targetConn.(*net.TCPConn); ok {
			tcp.CloseWrite()
		}
	}()

	// 6. 目标服务器到 -> 客户端
	_, err = io.Copy(clientConn, targetConn)
	if err != nil {
		log.Println("target -> client:", err)
	}

	log.Println("connection closed:", clientConn.RemoteAddr())
}

```
