from fastapi import FastAPI, Request, Form, status
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from datetime import datetime
from supabase import create_client, Client
from typing import Any

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key='your-secret-key-123')

# Supabase configuration
supabase_url = "https://rfvbyzumbdmofkcyywoj.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmJ5enVtYmRtb2ZrY3l5d29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzgwNjYsImV4cCI6MjA1NjQxNDA2Nn0.sPUY74XDEDtAA1IbS8H_Wqu_sTq_gR62zsY9wpBREkM"
supabase: Client = create_client(supabase_url, supabase_key)

templates = Jinja2Templates(directory="templates")

# Add custom URL generator to templates
def url_for(request: Request, name: str, **path_params: Any) -> str:
    return request.url_for(name, **path_params)

templates.env.globals['url_for'] = url_for

# ... rest of the app.py code remains the same ...

@app.get("/", name="index")
async def index(request: Request):
    messages = request.session.pop('messages', [])
    try:
        response = supabase.table('members').select('*').execute()
        members = response.data
        today = datetime.today().date()

        for member in members:
            try:
                end_date = datetime.strptime(member['end_date'], "%Y-%m-%d").date()
                member['status'] = (
                    "Expired" if end_date < today else
                    "Near Expiry" if (end_date - today).days <= 7 else
                    "Active"
                )
            except Exception:
                member['status'] = "Invalid Date"

            for date_field in ['join_date', 'end_date']:
                try:
                    dt = datetime.strptime(member[date_field], "%Y-%m-%d")
                    member[date_field] = dt.strftime("%d/%m/%Y")
                except:
                    pass

        return templates.TemplateResponse("index.html", {
            "request": request,
            "members": members,
            "messages": messages
        })

    except Exception as e:
        error_msg = f'Error loading members: {str(e)}'
        return templates.TemplateResponse("index.html", {
            "request": request,
            "members": [],
            "messages": [{'category': 'error', 'message': error_msg}]
        })

@app.post("/add_member")
async def add_member(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    join_date: str = Form(...),
    end_date: str = Form(...)
):
    try:
        member_data = {
            'name': name,
            'email': email.strip().lower(),
            'phone': phone,
            'join_date': join_date,
            'end_date': end_date
        }

        join_date_dt = datetime.strptime(join_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        if end_date_dt < join_date_dt:
            request.session['messages'] = [{'category': 'error', 'message': 'Expiry date cannot be before join date'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        existing = supabase.table('members').select('email').eq('email', member_data['email']).execute()
        if existing.data:
            request.session['messages'] = [{'category': 'error', 'message': 'Email already exists'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        response = supabase.table('members').insert(member_data).execute()
        if response.error:
            raise Exception(response.error.message)

        request.session['messages'] = [{'category': 'success', 'message': 'Member added successfully!'}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)

    except Exception as e:
        error_msg = str(e)
        if '23505' in error_msg:
            msg = 'Email already registered'
        else:
            msg = f'Error adding member: {error_msg}'
        request.session['messages'] = [{'category': 'error', 'message': msg}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)

@app.get("/delete_member/{member_id}", name="delete_member")
async def delete_member(request: Request, member_id: int):
    try:
        supabase.table('members').delete().eq('id', member_id).execute()
        request.session['messages'] = [{'category': 'success', 'message': 'Member deleted!'}]
    except Exception as e:
        request.session['messages'] = [{'category': 'error', 'message': f'Delete error: {str(e)}'}]
    return RedirectResponse(url=url_for(request, 'index'), status_code=303)

@app.get("/edit_member/{member_id}", name="edit_member_get")
async def edit_member_get(request: Request, member_id: int):
    try:
        response = supabase.table('members').select('*').eq('id', member_id).execute()
        member = response.data[0] if response.data else None
        if not member:
            request.session['messages'] = [{'category': 'error', 'message': 'Member not found'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        for date_field in ['join_date', 'end_date']:
            try:
                dt = datetime.strptime(member[date_field], "%Y-%m-%d")
                member[date_field] = dt.strftime("%Y-%m-%d")
            except:
                pass

        return templates.TemplateResponse("edit_member.html", {
            "request": request,
            "member": member
        })
    except Exception as e:
        request.session['messages'] = [{'category': 'error', 'message': str(e)}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)

@app.post("/edit_member/{member_id}", name="edit_member_post")
async def edit_member_post(
    request: Request,
    member_id: int,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    join_date: str = Form(...),
    end_date: str = Form(...)
):
    try:
        updated_data = {
            'name': name,
            'email': email,
            'phone': phone,
            'join_date': join_date,
            'end_date': end_date
        }

        join_date_dt = datetime.strptime(join_date, "%Y-%m-%d")
        end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")
        if end_date_dt < join_date_dt:
            request.session['messages'] = [{'category': 'error', 'message': 'Invalid expiry date'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        existing = supabase.table('members').select('email').eq('email', email).neq('id', member_id).execute()
        if existing.data:
            request.session['messages'] = [{'category': 'error', 'message': 'Email exists'}]
            return RedirectResponse(url=url_for(request, 'index'), status_code=303)

        supabase.table('members').update(updated_data).eq('id', member_id).execute()
        request.session['messages'] = [{'category': 'success', 'message': 'Member updated!'}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)
    
    except Exception as e:
        request.session['messages'] = [{'category': 'error', 'message': f'Update error: {str(e)}'}]
        return RedirectResponse(url=url_for(request, 'index'), status_code=303)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)