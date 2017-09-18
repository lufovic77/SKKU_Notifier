mport lion.message as plus_message

import json
import os

if __name__ == '__main__':
    current_path = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_path, 'data/data.json')
    with open(data_path, 'r', encoding='utf-8') as data_json:
        crawled = json.load(data_json)

    category_name = {"ict": "ICT 공과대학", "cse": "컴퓨터공학부", "accord": "서울어코드"}
    message_content = '에 새로운 공지사항이 있습니다!\n'

    for ict_notice in crawled["ict"]:
        plus_message.send_basic_text_message(category_name["ict"]+message_content + ict_notice["title"], ict_notice["url"])
    for cse_notice in crawled["cse"]:
        plus_message.send_basic_text_message(category_name["cse"]+message_content + cse_notice["title"], cse_notice["url"])
    for accord_notice in crawled["accord"]:
        plus_message.send_basic_text_message(category_name["accord"] + message_content + accord_notice["title"], accord_notice["url"])

