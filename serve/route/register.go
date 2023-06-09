package route

import (
	"log"
	"net/http"
	"tag-collect/serve/db"
	"tag-collect/serve/util"
	"time"
)

// 用户注册
//  path = /api/register
func Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	conn := db.GetConn()
	defer conn.Close()
	// 解析 POST 参数
	if err := r.ParseForm(); err != nil {
		w.Write(util.MakeErr("参数错误"))
		return
	}
	username := r.Form.Get("username")
	email := r.Form.Get("email")
	passwordMd5 := r.Form.Get("passwordMd5")
	verCode := r.Form.Get("verCode")
	
	// 校验验证码
	if !CheckVerCode(conn, email, verCode) {
		w.Write(util.MakeErr("验证码错误，请重新填写"))
		return
	}
	// 判断用户是否已经注册
	if CheckUserExists(conn, username, email) {
		w.Write(util.MakeErr("用户名或邮箱已经注册，您可以直接登录"))
		return
	}
	stmt, _ := conn.Prepare("INSERT INTO tag_collect_user (username, email, password_md5) VALUES (?, ?, ?)")
	if _, err := stmt.Exec(username, email, passwordMd5); err != nil {
		// 小记：此处用户名、邮箱、密码都是符合格式的，所以如果出错了，需要报致命错误
		log.Fatal(err)
	}
	token, err := InsertToken(conn, username)
	if err != nil {
		log.Fatal(err)
	}
	data := make(map[string]interface{})
	data["expires"] = SetTokenCookie(w, token)
	// 校验成功，移除验证码记录
	RemoveVerCode(conn, email)
	w.Write(util.MakeSuc("注册成功", data))
}

// 设置 Cookie-Token，返回 13 位的 expires 时间戳
func SetTokenCookie(w http.ResponseWriter, token string) int {

	expires := time.Now().Add(30 * 24 * time.Hour)
	cookie := &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		Expires:  expires,
		HttpOnly: true,
	}
	http.SetCookie(w, cookie)
	return int(expires.UnixNano() / int64(time.Millisecond))
}
