# 并发ssh远程登录

```go
package main

import (
	"bytes"
	"context"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/ssh"
	"log"
	"net/http"
	_ "net/http/pprof"
	"sync"
	"time"
)

type Device struct {
	ip   string
	name string
}

func main() {

	go func() {
		_ = http.ListenAndServe(":6060", nil)
	}()

	// 1 获取采集单元列表
	db, err := sql.Open("mysql", "root:harbork4275@tcp(192.168.3.129:3306)/testdb")
	if err != nil {
		panic(err)
	}
	var list []Device
	list = queryDevice(db)

	// 2 并发通过ssh登录采集单元获取网关和子网掩码

	ch := make(chan Device, 100)
	go func() {
		for _, d := range list {
			ch <- d
		}
		close(ch)
	}()

	// 这里我启动10个worker
	var wg sync.WaitGroup
	start := time.Now()
	workernum := 100
	for i := 0; i < workernum; i++ {
		wg.Add(1)
		go func() {
			for d := range ch {
				remoteShell(d.ip)
			}
			wg.Done()
		}()
	}
	wg.Wait()
	log.Printf("用时: %v", time.Since(start))

}

func queryDevice(db *sql.DB) []Device {
	ctx := context.Background()

	rows, err := db.QueryContext(ctx, "SELECT ip,name FROM smd_device")
	if err != nil {
		log.Fatal(err)
	}

	defer rows.Close() // 务必关闭rows,释放数据库连接

	var list []Device
	for rows.Next() {
		var d Device
		err := rows.Scan(&d.ip, &d.name)
		if err != nil {
			log.Fatal(err)
		}
		list = append(list, d)
	}

	if err = rows.Err(); err != nil {
		log.Fatalf("rows iter err: %v", err)
	}
	return list
}

func remoteShell(ip string) error {

	config := &ssh.ClientConfig{
		User: "root",
		Auth: []ssh.AuthMethod{
			ssh.Password("2016jimglobal"),
			ssh.Password("2020jgcxtech"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	client, err := ssh.Dial("tcp", ip+":22", config)
	if err != nil {
		log.Println(err)
		return err
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		log.Println("Failed to create session: ", err)
		return err
	}
	defer session.Close()

	var b bytes.Buffer
	session.Stdout = &b
	if err := session.Run("/bin/sh -c 'whoami'"); err != nil {
		log.Println("Failed to run: " + err.Error())
		return err
	}
	log.Printf("IP: %-18s, result: %s", ip, b.String())
	return nil
}

```
