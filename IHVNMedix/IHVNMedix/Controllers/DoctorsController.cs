﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using IHVNMedix.Models;
using IHVNMedix.Repositories;
using AutoMapper;
using IHVNMedix.DTOs;

namespace IHVNMedix.Controllers
{
    public class DoctorsController : Controller
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMapper _mapper;
        public DoctorsController(IDoctorRepository doctorRepository, IAppointmentRepository appointmentRepository, IMapper mapper)
        {
            _doctorRepository = doctorRepository;
            _appointmentRepository = appointmentRepository;
            _mapper = mapper;
        }

        // GET: Doctors
        public async Task<IActionResult> Index()
        {
            var doctors = await _doctorRepository.GetAllDoctorsAsync();
            var doctorDtos = _mapper.Map<IEnumerable<DoctorDto>>(doctors);
            return View(doctorDtos);
        }

        // GET: Doctors/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var doctor = await _doctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }
            var doctorDto = _mapper.Map<DoctorDto>(doctor);
            return View(doctorDto);
        }

        // GET: Doctors/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Doctors/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,FirstName,LastName,PhoneNumber,EmailAddress,Specialty")] Doctor doctor)
        {
            if (ModelState.IsValid)
            {
                await _doctorRepository.AddDoctorAsync(doctor);
                return RedirectToAction(nameof(Index));
            }
            var doctorDto = _mapper.Map<DoctorDto>(doctor);
            return View(doctorDto);
        }

        // GET: Doctors/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var doctor = await _doctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }
            var doctorDto = _mapper.Map<DoctorDto>(doctor);
            return View(doctorDto);
        }

        // POST: Doctors/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,FirstName,LastName,PhoneNumber,EmailAddress,Specialty")] Doctor doctor)
        {
            if (id != doctor.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    await _doctorRepository.UpdateDoctorAsync(doctor);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await DoctorExistsAsync(doctor.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            var doctorDto = _mapper.Map<DoctorDto>(doctor);
            return View(doctorDto);
        }

        // GET: Doctors/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var doctor = await _doctorRepository.GetDoctorByIdAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }
            var doctorDto = _mapper.Map<DoctorDto>(doctor);
            return View(doctorDto);
        }

        // POST: Doctors/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _doctorRepository.DeleteDoctorAsync(id);
            return RedirectToAction(nameof(Index));
        }

        private async Task<bool> DoctorExistsAsync(int id)
        {
            var doctor = await _doctorRepository.GetDoctorByIdAsync(id);
            return doctor != null;
        }

        //GET: Doctor/BookAppointment/5
        public IActionResult BookAppointment(int id)
        {
            var doctor = _doctorRepository.GetDoctorByIdAsync(id).Result;

            if (doctor == null) 
            {
                return NotFound();
            }

            //Create a new appointment
            var appointment = new Appointment
            {
                DoctorId = doctor.Id,
                //I will set more properties as needed
            };
            var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
            return View(appointmentDto);
        }

        //POST: Doctor/BookAppointment/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> BookAppointment(int id, [Bind("PatientId,DoctorId,AppointmentDateTime")] Appointment appointment)
        {
            if(ModelState.IsValid)
            {
                await _appointmentRepository.AddAppointmentAsync(appointment);
                return RedirectToAction(nameof(Index));
            }
            var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
            return View(appointmentDto);
        }
    }
}
