import http.server
import socketserver
import json
import os

class UABasedHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 获取User-Agent头
        user_agent = self.headers.get('User-Agent', '')
        
        # 判断是否是浏览器请求
        is_browser = self._is_browser_request(user_agent)
        
        # 如果是根路径请求
        if self.path == '/' or self.path == '/index.html':
            if is_browser:
                # 浏览器请求返回index.html
                self._serve_file('index.html', 'text/html')
            else:
                # 非浏览器请求返回resource.json
                self._serve_file('resource.json', 'application/json')
        else:
            # 其他路径使用默认处理
            super().do_GET()
    
    def _is_browser_request(self, user_agent):
        """判断是否是浏览器请求"""
        browser_keywords = [
            'Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge',
            'Opera', 'MSIE', 'Trident', 'AppleWebKit'
        ]
        
        # 检查User-Agent中是否包含浏览器关键词
        for keyword in browser_keywords:
            if keyword.lower() in user_agent.lower():
                return True
        
        return False
    
    def _serve_file(self, file_path, content_type):
        """提供文件服务"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # 发送响应头
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Content-length', len(content))
            self.end_headers()
            
            # 发送响应体
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, "File Not Found")
        except Exception as e:
            self.send_error(500, f"Internal Server Error: {str(e)}")

def main():
    """主函数"""
    PORT = 8000
    
    # 更改当前工作目录到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), UABasedHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("UA判断逻辑:")
        print("- 浏览器访问: 返回 index.html")
        print("- 非浏览器访问: 返回 resource.json")
        print("Press Ctrl+C to stop server")
        httpd.serve_forever()

if __name__ == "__main__":
    main()
